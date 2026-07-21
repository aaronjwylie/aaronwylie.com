'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiUrl } from '@/lib/api';

interface Monitor {
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

function dotColor(up: boolean | null): string {
  if (up === null) return 'bg-slate-500';
  return up ? 'bg-emerald-400' : 'bg-red-400';
}

function expiresIn(iso: string | null): string | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'expiring';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function StatusPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [url, setUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/status`, { cache: 'no-store' });
      const data = await res.json();
      setMonitors(data.monitors ?? []);
      setLoaded(true);
    } catch {
      /* keep previous data on transient errors */
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15_000);
    return () => clearInterval(t);
  }, [load]);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/monitors`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setUrl('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="container-page py-16">
      <p className="section-label mb-4">Tools</p>
      <h1 className="mb-3 text-4xl font-extrabold text-white">Live Status Monitor</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        A real uptime monitor: my API checks each endpoint every 60 seconds and stores the results.
        Add any URL to watch it live for 24 hours - checks, uptime %, and response time, all served
        by my own background worker.
      </p>

      <form onSubmit={onAdd} className="mb-4 flex max-w-xl flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com — add a URL to monitor"
          className="flex-1 rounded-lg border border-white/10 bg-ink-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
        />
        <button type="submit" disabled={adding} className="btn-primary px-6 py-3 disabled:opacity-60">
          {adding ? 'Adding…' : 'Monitor it'}
        </button>
      </form>
      {error && <p className="mb-6 text-sm text-red-400">{error}</p>}

      <div className="space-y-4">
        {monitors.map((m) => (
          <div key={m.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${dotColor(m.up)} ${m.up ? 'shadow-[0_0_10px] shadow-emerald-400/60' : ''}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{m.host}</span>
                    {m.permanent ? (
                      <span className="chip">core</span>
                    ) : (
                      <span className="chip">expires in {expiresIn(m.expiresAt)}</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    {m.up === null ? 'awaiting first check' : m.up ? 'Operational' : 'Down'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-right text-sm">
                <div>
                  <div className="font-semibold text-white">{m.uptime != null ? `${m.uptime}%` : '—'}</div>
                  <div className="text-xs text-slate-500">uptime 24h</div>
                </div>
                <div>
                  <div className="font-semibold text-white">{m.avgMs != null ? `${m.avgMs} ms` : '—'}</div>
                  <div className="text-xs text-slate-500">avg response</div>
                </div>
              </div>
            </div>

            {/* Uptime bar strip (last 30 checks) */}
            <div className="mt-4 flex h-8 items-end gap-[3px]">
              {m.history.length === 0 && (
                <span className="text-xs text-slate-600">Collecting data…</span>
              )}
              {m.history.map((h, i) => (
                <div
                  key={i}
                  title={h.ok ? `${h.ms ?? '?'} ms` : 'down'}
                  className={`w-full max-w-[10px] flex-1 rounded-sm ${h.ok ? 'bg-emerald-400/70' : 'bg-red-400/80'}`}
                  style={{ height: `${h.ok ? Math.min(100, 30 + (h.ms ?? 0) / 15) : 100}%` }}
                />
              ))}
            </div>
          </div>
        ))}
        {loaded && monitors.length === 0 && (
          <p className="text-slate-400">No monitors yet — add one above.</p>
        )}
      </div>

      <p className="mt-8 max-w-2xl text-xs text-slate-500">
        Added URLs are checked from my server (private/internal addresses are refused) and
        auto-expire after 24 hours. Powered by a background worker in the same API that serves this
        site.
      </p>
    </div>
  );
}
