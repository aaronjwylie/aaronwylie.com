'use client';

import { useState } from 'react';
import { apiUrl } from '@/lib/api';

interface InspectResult {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  statusText: string;
  ok: boolean;
  timingMs: number;
  redirects: { url: string; status: number }[];
  server: string | null;
  headers: Record<string, string>;
  tls: {
    issuer: string;
    subject: string;
    validFrom: string;
    validTo: string;
    daysRemaining: number;
    authorized: boolean;
    authorizationError: string | null;
  } | null;
  security: { grade: string; score: number; checks: { label: string; present: boolean }[] };
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10';
  if (status >= 300 && status < 400) return 'text-sky-400 border-sky-400/40 bg-sky-400/10';
  if (status >= 400 && status < 500) return 'text-amber-400 border-amber-400/40 bg-amber-400/10';
  return 'text-red-400 border-red-400/40 bg-red-400/10';
}

function gradeColor(grade: string): string {
  return (
    {
      A: 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10',
      B: 'text-teal-400 border-teal-400/40 bg-teal-400/10',
      C: 'text-amber-400 border-amber-400/40 bg-amber-400/10',
      D: 'text-orange-400 border-orange-400/40 bg-orange-400/10',
      F: 'text-red-400 border-red-400/40 bg-red-400/10',
    }[grade] ?? 'text-slate-300 border-white/20 bg-white/5'
  );
}

function expiryColor(days: number): string {
  if (days < 7) return 'text-red-400';
  if (days < 21) return 'text-amber-400';
  return 'text-emerald-400';
}

export default function InspectorPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InspectResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${apiUrl}/inspect`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setResult(data as InspectResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-16">
      <p className="section-label mb-4">Tools</p>
      <h1 className="mb-3 text-4xl font-extrabold text-white">Endpoint Inspector</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        Enter any website or API URL to see its HTTP status, response time, redirect chain, TLS
        certificate, and a security-header grade. Runs server-side through my API - try it.
      </p>

      <form onSubmit={onSubmit} className="mb-10 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com  or  https://api.example.com/health"
          className="flex-1 rounded-lg border border-white/10 bg-ink-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
        />
        <button type="submit" disabled={loading} className="btn-primary px-6 py-3 disabled:opacity-60">
          {loading ? 'Inspecting…' : 'Inspect'}
        </button>
      </form>

      {error && (
        <div className="card border-red-400/40 bg-red-400/5 text-red-300">
          <strong>Couldn&apos;t inspect that:</strong> {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="card">
            <div className="flex flex-wrap items-center gap-4">
              <span className={`rounded-lg border px-3 py-1 text-lg font-bold ${statusColor(result.status)}`}>
                {result.status} {result.statusText}
              </span>
              <span className="text-slate-300">
                <span className="font-semibold text-white">{result.timingMs} ms</span> response time
              </span>
              {result.server && (
                <span className="chip">server: {result.server}</span>
              )}
            </div>
            <p className="mt-3 break-all text-sm text-slate-400">
              <span className="text-slate-500">Final URL:</span> {result.finalUrl}
            </p>
            {result.redirects.length > 0 && (
              <div className="mt-3 text-sm">
                <p className="section-label mb-1">Redirect chain</p>
                <ol className="space-y-1 text-slate-400">
                  {result.redirects.map((r, i) => (
                    <li key={i} className="break-all">
                      <span className={`mr-2 font-mono ${statusColor(r.status).split(' ')[0]}`}>{r.status}</span>
                      {r.url}
                    </li>
                  ))}
                  <li className="break-all">
                    <span className="mr-2 font-mono text-emerald-400">{result.status}</span>
                    {result.finalUrl}
                  </li>
                </ol>
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* TLS */}
            <div className="card">
              <h2 className="mb-3 text-lg font-bold text-white">TLS certificate</h2>
              {result.tls ? (
                <dl className="space-y-2 text-sm">
                  <Row label="Issuer" value={result.tls.issuer} />
                  <Row label="Subject" value={result.tls.subject} />
                  <Row label="Valid from" value={result.tls.validFrom} />
                  <Row label="Valid to" value={result.tls.validTo} />
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Expires in</dt>
                    <dd className={`font-semibold ${expiryColor(result.tls.daysRemaining)}`}>
                      {result.tls.daysRemaining} days
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Trust</dt>
                    <dd className={result.tls.authorized ? 'text-emerald-400' : 'text-amber-400'}>
                      {result.tls.authorized ? 'Valid chain' : result.tls.authorizationError}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-slate-400">No TLS (served over plain HTTP).</p>
              )}
            </div>

            {/* Security headers */}
            <div className="card">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Security headers</h2>
                <span className={`rounded-lg border px-3 py-1 text-lg font-bold ${gradeColor(result.security.grade)}`}>
                  {result.security.grade}
                </span>
              </div>
              <ul className="space-y-1.5 text-sm">
                {result.security.checks.map((c) => (
                  <li key={c.label} className="flex items-center gap-2">
                    <span className={c.present ? 'text-emerald-400' : 'text-slate-600'}>
                      {c.present ? '✓' : '✗'}
                    </span>
                    <span className={c.present ? 'text-slate-300' : 'text-slate-500'}>{c.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Raw headers */}
          <details className="card">
            <summary className="cursor-pointer text-lg font-bold text-white">Response headers</summary>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <tbody>
                  {Object.entries(result.headers).map(([k, v]) => (
                    <tr key={k} className="border-t border-white/5">
                      <td className="py-1.5 pr-4 font-mono text-accent">{k}</td>
                      <td className="break-all py-1.5 text-slate-300">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="break-all text-right text-slate-300">{value}</dd>
    </div>
  );
}
