'use client';

import { useEffect, useMemo, useState } from 'react';

function parseInput(raw: string): Date | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^\d+$/.test(s)) {
    // All digits: epoch. >= 12 digits is almost certainly milliseconds.
    const n = Number(s);
    return new Date(s.length >= 12 ? n : n * 1000);
  }
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t);
}

function relative(date: Date): string {
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const units: [number, string][] = [
    [31536000000, 'year'],
    [2592000000, 'month'],
    [86400000, 'day'],
    [3600000, 'hour'],
    [60000, 'minute'],
    [1000, 'second'],
  ];
  for (const [ms, name] of units) {
    if (abs >= ms) {
      const v = Math.round(abs / ms);
      const plural = v === 1 ? name : `${name}s`;
      return diff >= 0 ? `in ${v} ${plural}` : `${v} ${plural} ago`;
    }
  }
  return 'just now';
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-white/5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="font-mono text-sm text-white">{value}</span>
    </div>
  );
}

export default function TimestampPage() {
  const [input, setInput] = useState('');
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const date = useMemo(() => parseInput(input), [input]);

  return (
    <div className="container-page py-16">
      <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">Unix Timestamp Converter</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        Convert a Unix timestamp (seconds or milliseconds) to a readable date and back. Type an epoch
        or any date - it converts instantly.
      </p>

      {/* Live current epoch */}
      <div className="card mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-label mb-1">Current Unix time</p>
          <p className="font-mono text-2xl font-bold text-accent-cyan">{now ? Math.floor(now / 1000) : '—'}</p>
          <p className="mt-0.5 font-mono text-xs text-slate-500">{now || '—'} ms</p>
        </div>
        <button onClick={() => setInput(String(Math.floor(Date.now() / 1000)))} className="btn-ghost">
          Use current
        </button>
      </div>

      <div className="card mb-6">
        <p className="section-label mb-2">Timestamp or date</p>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="1719878400  ·  or  2026-07-24 09:00"
          className="w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 font-mono text-lg text-white focus:border-accent focus:outline-none"
        />
      </div>

      {input.trim() && (
        <div className="card">
          {date ? (
            <>
              <Row label="Unix (seconds)" value={String(Math.floor(date.getTime() / 1000))} />
              <Row label="Unix (milliseconds)" value={String(date.getTime())} />
              <Row label="ISO 8601" value={date.toISOString()} />
              <Row label="UTC" value={date.toUTCString()} />
              <Row label="Local" value={date.toString()} />
              <Row label="Relative" value={relative(date)} />
            </>
          ) : (
            <p className="text-sm text-rose-400">Could not parse that as a timestamp or date.</p>
          )}
        </div>
      )}
    </div>
  );
}
