import type { FastifyBaseLogger } from 'fastify';
import { and, eq, isNotNull, like, sql as dsql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { pageViews } from '../db/schema.js';
import { sendUsageDigest, type UsageDigest } from '../lib/mail.js';

// Fire the digest at this UTC hour daily (~07:00 America/Vancouver in summer).
const DIGEST_UTC_HOUR = 14;

function ymd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Aggregate a single day's page views into the digest shape (no IPs involved). */
export async function buildSummary(day: string): Promise<UsageDigest> {
  const onDay = eq(pageViews.day, day);
  const count = dsql<number>`count(*)::int`;

  const [totals] = await db
    .select({
      total: count,
      unique: dsql<number>`count(distinct ${pageViews.visitorHash})::int`,
      tools: dsql<number>`count(*) filter (where ${pageViews.path} like '/tools%')::int`,
      located: dsql<number>`count(*) filter (where ${pageViews.country} is not null)::int`,
    })
    .from(pageViews)
    .where(onDay);

  const topTools = await db
    .select({ path: pageViews.path, views: count })
    .from(pageViews)
    .where(and(onDay, like(pageViews.path, '/tools/%')))
    .groupBy(pageViews.path)
    .orderBy(dsql`count(*) desc`)
    .limit(12);

  const topPages = await db
    .select({ path: pageViews.path, views: count })
    .from(pageViews)
    .where(onDay)
    .groupBy(pageViews.path)
    .orderBy(dsql`count(*) desc`)
    .limit(10);

  const topCountries = await db
    .select({ country: pageViews.country, views: count })
    .from(pageViews)
    .where(and(onDay, isNotNull(pageViews.country)))
    .groupBy(pageViews.country)
    .orderBy(dsql`count(*) desc`)
    .limit(10);

  const topCitiesRaw = await db
    .select({ city: pageViews.city, country: pageViews.country, views: count })
    .from(pageViews)
    .where(and(onDay, isNotNull(pageViews.city)))
    .groupBy(pageViews.city, pageViews.country)
    .orderBy(dsql`count(*) desc`)
    .limit(10);

  return {
    day,
    totalViews: totals?.total ?? 0,
    uniqueVisitors: totals?.unique ?? 0,
    toolViews: totals?.tools ?? 0,
    locatedViews: totals?.located ?? 0,
    topTools: topTools.map((t) => ({ path: t.path, views: t.views })),
    topPages: topPages.map((t) => ({ path: t.path, views: t.views })),
    topCountries: topCountries.map((t) => ({ country: t.country ?? 'Unknown', views: t.views })),
    topCities: topCitiesRaw.map((t) => ({
      label: [t.city, t.country].filter(Boolean).join(', '),
      views: t.views,
    })),
  };
}

/** Build and (unless empty/forced-off) send the digest for a day. */
export async function runDigest(
  log: FastifyBaseLogger,
  day: string,
  opts: { force?: boolean } = {},
): Promise<{ sent: boolean; summary: UsageDigest }> {
  const summary = await buildSummary(day);
  if (summary.totalViews === 0 && !opts.force) {
    log.info({ day }, 'usage digest skipped (no activity)');
    return { sent: false, summary };
  }
  const sent = await sendUsageDigest(summary, log);
  return { sent, summary };
}

/** Schedule the digest once per day at DIGEST_UTC_HOUR, summarising yesterday. */
export function startDigestScheduler(log: FastifyBaseLogger): void {
  const msUntilNext = (): number => {
    const now = new Date();
    const next = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), DIGEST_UTC_HOUR, 0, 0),
    );
    if (next.getTime() <= now.getTime()) next.setUTCDate(next.getUTCDate() + 1);
    return next.getTime() - now.getTime();
  };

  const schedule = () => {
    setTimeout(
      () => {
        const yesterday = new Date(Date.now() - 86_400_000);
        // Forced: a quiet day is itself information, and skipping the send
        // makes "no traffic" look identical to "the digest is broken".
        void runDigest(log, ymd(yesterday), { force: true }).catch((err) =>
          log.error(err, 'usage digest run failed'),
        );
        schedule();
      },
      msUntilNext(),
    ).unref?.();
  };

  schedule();
  log.info({ hourUtc: DIGEST_UTC_HOUR }, 'usage digest scheduled');
}
