import { and, eq, lt, sql as dsql } from 'drizzle-orm';
import type { FastifyBaseLogger } from 'fastify';
import { db, sql } from '../db/client.js';
import { monitors, monitorChecks } from '../db/schema.js';
import { assertSafeUrl, InspectError } from '../lib/inspect.js';

const CHECK_INTERVAL_MS = 60_000;
const MONITOR_TTL_HOURS = 24;
const MAX_EPHEMERAL = 30;
const REQUEST_TIMEOUT_MS = 8_000;

// Permanent monitors — my own infra + a couple of well-known endpoints for contrast.
const DEFAULTS = [
  { url: 'https://aaronwylie.com', host: 'aaronwylie.com' },
  { url: 'https://aaronwylie.com/api/health', host: 'aaronwylie.com/api' },
  { url: 'https://github.com', host: 'github.com' },
  { url: 'https://www.google.com', host: 'google.com' },
];

type CheckResult = { ok: boolean; statusCode: number | null; responseMs: number | null };

async function checkOne(url: string): Promise<CheckResult> {
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: { 'user-agent': 'aaronwylie.com-uptime-monitor' },
    });
    await res.body?.cancel().catch(() => {});
    return {
      ok: res.status >= 200 && res.status < 400,
      statusCode: res.status,
      responseMs: Date.now() - t0,
    };
  } catch {
    return { ok: false, statusCode: null, responseMs: null };
  }
}

export async function ensureDefaultMonitors(): Promise<void> {
  for (const d of DEFAULTS) {
    await db
      .insert(monitors)
      .values({ url: d.url, host: d.host, permanent: true, expiresAt: null })
      .onConflictDoNothing();
  }
}

/** Add a visitor monitor (ephemeral, SSRF-checked). Throws InspectError on bad input. */
export async function addMonitor(rawUrl: string): Promise<{ id: number }> {
  const u = await assertSafeUrl(rawUrl);
  const url = u.toString();
  const [countRow] = await sql<{ count: number }[]>`
    select count(*)::int as count from monitors
    where permanent = false and (expires_at is null or expires_at > now())`;
  if ((countRow?.count ?? 0) >= MAX_EPHEMERAL) {
    throw new InspectError('The monitor board is full right now — please try again later.');
  }
  const expiresAt = new Date(Date.now() + MONITOR_TTL_HOURS * 3_600_000);
  const [row] = await db
    .insert(monitors)
    .values({ url, host: u.hostname, permanent: false, expiresAt })
    .onConflictDoUpdate({ target: monitors.url, set: { expiresAt } })
    .returning({ id: monitors.id });
  const c = await checkOne(url);
  await db.insert(monitorChecks).values({ monitorId: row!.id, ...c });
  return { id: row!.id };
}

async function runChecks(log?: FastifyBaseLogger): Promise<void> {
  // Purge expired ephemeral monitors and checks older than the retention window.
  await db
    .delete(monitors)
    .where(and(eq(monitors.permanent, false), lt(monitors.expiresAt, new Date())));
  await sql`delete from monitor_checks where checked_at < now() - interval '24 hours'`;

  const active = await db.select({ id: monitors.id, url: monitors.url }).from(monitors);
  await Promise.all(
    active.map(async (m) => {
      const c = await checkOne(m.url);
      await db.insert(monitorChecks).values({ monitorId: m.id, ...c });
    }),
  );
  log?.debug({ count: active.length }, 'uptime checks completed');
}

/** Start the background monitoring loop. Called once on server boot. */
export function startMonitorLoop(log: FastifyBaseLogger): void {
  void ensureDefaultMonitors()
    .then(() => runChecks(log))
    .catch((e) => log.error(e, 'monitor init failed'));
  setInterval(() => {
    void runChecks(log).catch((e) => log.error(e, 'monitor loop error'));
  }, CHECK_INTERVAL_MS).unref();
}

export interface MonitorStatus {
  id: number;
  host: string;
  url: string;
  permanent: boolean;
  expiresAt: string | null;
  up: boolean | null;
  uptime: number | null;
  avgMs: number | null;
  lastCheckedAt: string | null;
  history: { ok: boolean; ms: number | null }[];
}

export async function getStatus(): Promise<MonitorStatus[]> {
  const mons = await db.select().from(monitors).orderBy(dsql`permanent desc, created_at asc`);

  const aggregates = await sql<
    { monitor_id: number; total: number; ok_count: number; avg_ms: number | null; last_at: Date | null }[]
  >`
    select monitor_id, count(*)::int as total, sum((ok)::int)::int as ok_count,
           avg(response_ms) filter (where ok) as avg_ms, max(checked_at) as last_at
    from monitor_checks where checked_at > now() - interval '24 hours'
    group by monitor_id`;

  const history = await sql<
    { monitor_id: number; ok: boolean; response_ms: number | null }[]
  >`
    select monitor_id, ok, response_ms from (
      select monitor_id, ok, response_ms, checked_at,
             row_number() over (partition by monitor_id order by checked_at desc) rn
      from monitor_checks where checked_at > now() - interval '24 hours'
    ) t where rn <= 30 order by checked_at asc`;

  const aggById = new Map(aggregates.map((a) => [a.monitor_id, a]));
  const histById = new Map<number, { ok: boolean; ms: number | null }[]>();
  for (const h of history) {
    const arr = histById.get(h.monitor_id) ?? [];
    arr.push({ ok: h.ok, ms: h.response_ms });
    histById.set(h.monitor_id, arr);
  }

  return mons.map((m) => {
    const a = aggById.get(m.id);
    const hist = histById.get(m.id) ?? [];
    const total = a?.total ?? 0;
    const okc = a?.ok_count ?? 0;
    const latest = hist[hist.length - 1];
    return {
      id: m.id,
      host: m.host,
      url: m.url,
      permanent: m.permanent,
      expiresAt: m.expiresAt ? m.expiresAt.toISOString() : null,
      up: latest ? latest.ok : null,
      uptime: total ? Math.round((okc / total) * 1000) / 10 : null,
      avgMs: a?.avg_ms != null ? Math.round(Number(a.avg_ms)) : null,
      lastCheckedAt: a?.last_at ? new Date(a.last_at).toISOString() : null,
      history: hist,
    };
  });
}
