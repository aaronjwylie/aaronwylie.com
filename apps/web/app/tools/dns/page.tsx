'use client';

import { useState } from 'react';
import { apiUrl } from '@/lib/api';

interface DnsResult {
  domain: string;
  records: { A: string[]; AAAA: string[]; MX: string[]; TXT: string[]; NS: string[]; CNAME: string[] };
  registration: {
    registrar: string | null;
    created: string | null;
    expires: string | null;
    status: string[];
  } | null;
}

const RECORD_ORDER: (keyof DnsResult['records'])[] = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT'];

export default function DnsPage() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DnsResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${apiUrl}/dns`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString() : '—');

  return (
    <div className="container-page py-16">
      <p className="section-label mb-4">Tools</p>
      <h1 className="mb-3 text-4xl font-extrabold text-white">DNS &amp; WHOIS Lookup</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        Look up a domain&apos;s DNS records (A, AAAA, CNAME, MX, NS, TXT) and registration details -
        registrar, creation and expiry - resolved server-side by my API (registration via RDAP, the
        modern WHOIS).
      </p>

      <form onSubmit={onSubmit} className="mb-10 flex max-w-xl flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          className="flex-1 rounded-lg border border-white/10 bg-ink-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
        />
        <button type="submit" disabled={loading} className="btn-primary px-6 py-3 disabled:opacity-60">
          {loading ? 'Looking up…' : 'Look up'}
        </button>
      </form>

      {error && <div className="card border-red-400/40 bg-red-400/5 text-red-300">{error}</div>}

      {result && (
        <div className="space-y-6">
          {result.registration && (
            <div className="card">
              <p className="section-label mb-3">Registration</p>
              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-slate-500">Registrar</dt>
                  <dd className="text-slate-200">{result.registration.registrar ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Created</dt>
                  <dd className="text-slate-200">{fmt(result.registration.created)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Expires</dt>
                  <dd className="text-slate-200">{fmt(result.registration.expires)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Status</dt>
                  <dd className="truncate text-slate-200" title={result.registration.status.join(', ')}>
                    {result.registration.status[0] ?? '—'}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {RECORD_ORDER.map((type) => {
              const rows = result.records[type];
              return (
                <div key={type} className="card">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono font-bold text-accent">{type}</span>
                    <span className="text-xs text-slate-500">{rows.length}</span>
                  </div>
                  {rows.length === 0 ? (
                    <p className="text-sm text-slate-600">No records</p>
                  ) : (
                    <ul className="space-y-1 text-sm">
                      {rows.map((r, i) => (
                        <li key={i} className="break-all font-mono text-slate-300">
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
