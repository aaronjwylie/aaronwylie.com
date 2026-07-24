'use client';

import { useEffect, useRef, useState } from 'react';
import { apiUrl } from '@/lib/api';

interface Result {
  valid: boolean;
  description?: string;
  next?: string[];
  error?: string;
  tz?: string;
}

const EXAMPLES: { expr: string; label: string }[] = [
  { expr: '* * * * *', label: 'Every minute' },
  { expr: '*/15 * * * *', label: 'Every 15 min' },
  { expr: '0 * * * *', label: 'Hourly' },
  { expr: '0 9 * * 1-5', label: 'Weekdays 9am' },
  { expr: '0 0 * * 0', label: 'Weekly (Sun)' },
  { expr: '0 0 1 * *', label: 'Monthly' },
];

const ZONES = ['UTC', 'America/Vancouver', 'America/New_York', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo', 'Australia/Sydney'];

function fmt(iso: string, tz: string) {
  try {
    return new Date(iso).toLocaleString('en-CA', {
      timeZone: tz,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function CronPage() {
  const [expr, setExpr] = useState('0 9 * * 1-5');
  const [tz, setTz] = useState('UTC');
  const [result, setResult] = useState<Result | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      if (!expr.trim()) return setResult(null);
      try {
        const q = new URLSearchParams({ expr, tz });
        const res = await fetch(`${apiUrl}/cron?${q}`, { cache: 'no-store' });
        setResult(await res.json());
      } catch {
        setResult({ valid: false, error: 'Could not reach the server.' });
      }
    }, 250);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [expr, tz]);

  return (
    <div className="container-page py-16">
      <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">Cron Expression Explainer</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        Paste a cron expression to see what it means in plain English and exactly when it will next
        run, in the timezone of your choice.
      </p>

      <div className="card mb-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder="0 9 * * 1-5"
            className="flex-1 rounded-lg border border-white/10 bg-ink-950 px-3 py-2 font-mono text-lg text-accent-cyan focus:border-accent focus:outline-none"
          />
          <select
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            className="rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
          >
            {ZONES.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.expr}
              onClick={() => setExpr(ex.expr)}
              className="chip hover:border-accent/40 hover:text-accent"
              title={ex.expr}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className="card">
          {result.valid ? (
            <>
              <p className="section-label mb-2">Meaning</p>
              <p className="mb-6 text-xl font-semibold text-white">{result.description}</p>
              <p className="section-label mb-2">Next 5 runs ({tz})</p>
              <ul className="space-y-1.5 font-mono text-sm text-slate-300">
                {result.next?.map((n) => (
                  <li key={n} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
                    {fmt(n, tz)}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-rose-400">{result.error || 'Invalid cron expression.'}</p>
          )}
        </div>
      )}
    </div>
  );
}
