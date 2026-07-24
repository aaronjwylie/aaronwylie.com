'use client';

import { useEffect, useRef, useState } from 'react';
import { apiUrl } from '@/lib/api';

interface Result {
  email: string;
  syntaxValid: boolean;
  local: string;
  domain: string;
  hasMx: boolean;
  mx: { exchange: string; priority: number }[];
  disposable: boolean;
  roleBased: boolean;
  deliverable: boolean;
}

function Check({ ok, label, warn }: { ok: boolean; label: string; warn?: boolean }) {
  const color = warn ? (ok ? 'text-amber-400' : 'text-slate-400') : ok ? 'text-emerald-400' : 'text-rose-400';
  const mark = warn ? (ok ? '!' : '·') : ok ? '✓' : '✗';
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`font-bold ${color}`}>{mark}</span>
      <span className="text-slate-300">{label}</span>
    </div>
  );
}

export default function EmailPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (!email.trim() || !email.includes('@')) {
      setResult(null);
      return;
    }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/email/validate?email=${encodeURIComponent(email.trim())}`, {
          cache: 'no-store',
        });
        setResult(await res.json());
      } catch {
        setResult(null);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [email]);

  return (
    <div className="container-page py-16">
      <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">Email Validator</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        Check an email address: valid syntax, whether the domain can actually receive mail (live MX
        lookup), and whether it&apos;s a disposable or role-based address.
      </p>

      <div className="card mb-6">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          className="w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-lg text-white focus:border-accent focus:outline-none"
        />
      </div>

      {loading && !result && <div className="card text-sm text-slate-400">Checking…</div>}

      {result && (
        <div className="card">
          <div className="mb-5 flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                result.deliverable
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : result.syntaxValid
                    ? 'bg-amber-500/15 text-amber-300'
                    : 'bg-rose-500/15 text-rose-300'
              }`}
            >
              {result.deliverable ? 'Looks deliverable' : result.syntaxValid ? 'Risky' : 'Invalid'}
            </span>
            <span className="font-mono text-sm text-slate-400">{result.domain}</span>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Check ok={result.syntaxValid} label="Valid syntax" />
            <Check ok={result.hasMx} label="Domain accepts mail (MX)" />
            <Check ok={result.disposable} label="Disposable domain" warn />
            <Check ok={result.roleBased} label="Role-based address" warn />
          </div>

          {result.mx.length > 0 && (
            <div className="mt-5">
              <p className="section-label mb-2">MX records</p>
              <ul className="space-y-1 font-mono text-xs text-slate-300">
                {result.mx.map((m) => (
                  <li key={m.exchange}>
                    <span className="text-slate-500">{m.priority}</span> {m.exchange}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
