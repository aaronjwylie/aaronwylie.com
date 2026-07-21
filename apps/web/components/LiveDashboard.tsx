'use client';

import { useEffect, useState } from 'react';
import { apiUrl } from '@/lib/api';

interface Observability {
  uptimeSeconds: number;
  node: { version: string; rssMb: number; heapUsedMb: number; eventLoopLagMs: number };
  http: {
    totalRequests: number;
    byStatusClass: Record<string, number>;
    errorRatePct: number;
    latencyMs: { p50: number; p95: number; p99: number };
    topRoutes: { method: string; route: string; count: number }[];
  };
}

const POLL_MS = 5000;

function fmtUptime(s: number): string {
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function fmtNum(n: number): string {
  return n.toLocaleString();
}

const STATUS_COLORS: Record<string, string> = {
  '2xx': 'bg-emerald-500',
  '3xx': 'bg-sky-500',
  '4xx': 'bg-amber-500',
  '5xx': 'bg-rose-500',
};

export function LiveDashboard() {
  const [data, setData] = useState<Observability | null>(null);
  const [error, setError] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch(`${apiUrl}/observability`, { cache: 'no-store' });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as Observability;
        if (!alive) return;
        setData(json);
        setError(false);
        setPulse((p) => p + 1);
      } catch {
        if (alive) setError(true);
      }
    }
    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (error && !data) {
    return (
      <div className="card">
        <p className="text-slate-300">
          The metrics endpoint didn&apos;t respond. The API may be restarting - this page will
          recover automatically once it&apos;s back.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card animate-pulse">
        <p className="text-slate-400">Connecting to the live metrics feed…</p>
      </div>
    );
  }

  const { http, node } = data;
  const statusTotal = Object.values(http.byStatusClass).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Live indicator */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <span className="relative flex h-2.5 w-2.5">
          <span
            key={pulse}
            className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"
          />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        Live · refreshes every {POLL_MS / 1000}s · figures are since the last deploy
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric label="Uptime" value={fmtUptime(data.uptimeSeconds)} />
        <Metric label="Requests served" value={fmtNum(http.totalRequests)} />
        <Metric label="p95 latency" value={`${http.latencyMs.p95} ms`} />
        <Metric
          label="Error rate"
          value={`${http.errorRatePct}%`}
          tone={http.errorRatePct > 1 ? 'warn' : 'ok'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Latency */}
        <div className="card">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-accent-cyan">
            Response latency
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <Sub label="p50" value={`${http.latencyMs.p50} ms`} />
            <Sub label="p95" value={`${http.latencyMs.p95} ms`} />
            <Sub label="p99" value={`${http.latencyMs.p99} ms`} />
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Estimated from the request-duration histogram, the same data Prometheus would scrape.
          </p>
        </div>

        {/* Status mix */}
        <div className="card">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-accent-cyan">
            Response status mix
          </h3>
          <div className="mb-3 flex h-3 w-full overflow-hidden rounded-full bg-white/5">
            {(['2xx', '3xx', '4xx', '5xx'] as const).map((cls) => {
              const pct = ((http.byStatusClass[cls] ?? 0) / statusTotal) * 100;
              return pct > 0 ? (
                <div key={cls} className={STATUS_COLORS[cls]} style={{ width: `${pct}%` }} />
              ) : null;
            })}
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {(['2xx', '3xx', '4xx', '5xx'] as const).map((cls) => (
              <div key={cls}>
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[cls]}`} />
                  {cls}
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {fmtNum(http.byStatusClass[cls] ?? 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Process health */}
        <div className="card">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-accent-cyan">
            Process health
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Sub label="Node" value={node.version} />
            <Sub label="Event-loop lag" value={`${node.eventLoopLagMs} ms`} />
            <Sub label="Memory (RSS)" value={`${node.rssMb} MB`} />
            <Sub label="Heap used" value={`${node.heapUsedMb} MB`} />
          </div>
        </div>

        {/* Top routes */}
        <div className="card">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-accent-cyan">
            Busiest routes
          </h3>
          <ul className="space-y-2 text-sm">
            {http.topRoutes.map((r) => (
              <li key={`${r.method} ${r.route}`} className="flex items-center justify-between gap-3">
                <span className="truncate font-mono text-slate-300">
                  <span className="text-accent-cyan">{r.method}</span> {r.route}
                </span>
                <span className="shrink-0 font-semibold text-white">{fmtNum(r.count)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'warn' }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-900/60 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p
        className={`mt-1 text-2xl font-extrabold sm:text-3xl ${
          tone === 'warn' ? 'text-rose-400' : 'gradient-text'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Sub({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-bold text-white">{value}</p>
    </div>
  );
}
