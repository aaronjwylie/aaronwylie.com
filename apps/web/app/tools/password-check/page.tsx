'use client';

import { useState } from 'react';
import { apiUrl } from '@/lib/api';

/** SHA-1 of a string → uppercase hex, computed in the browser (Web Crypto). */
async function sha1Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

type Result = { breached: boolean; count: number };

export default function PasswordCheckPage() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const hash = await sha1Hex(password);
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);
      const res = await fetch(`${apiUrl}/breach-check`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prefix }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      const match = (data.ranges as { suffix: string; count: number }[]).find(
        (r) => r.suffix === suffix,
      );
      setResult({ breached: !!match, count: match?.count ?? 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-16">
      <p className="section-label mb-4">Tools</p>
      <h1 className="mb-3 text-4xl font-extrabold text-white">Password Breach Checker</h1>
      <p className="mb-6 max-w-2xl text-lg text-slate-400">
        Check whether a password has appeared in a known data breach. Your password is hashed in your
        browser and <strong className="text-slate-200">never sent</strong> - only the first 5
        characters of its hash leave your device (k-anonymity, via HaveIBeenPwned).
      </p>

      <form onSubmit={onSubmit} className="mb-8 max-w-xl">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a password to test"
              autoComplete="off"
              className="w-full rounded-lg border border-white/10 bg-ink-950 px-4 py-3 pr-16 text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-white"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
          <button type="submit" disabled={loading} className="btn-primary px-6 py-3 disabled:opacity-60">
            {loading ? 'Checking…' : 'Check'}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Tip: don&apos;t paste a password you actively use - test variations instead.
        </p>
      </form>

      {error && (
        <div className="card max-w-xl border-red-400/40 bg-red-400/5 text-red-300">{error}</div>
      )}

      {result && (
        <div
          className={`card max-w-xl ${
            result.breached ? 'border-red-400/40 bg-red-400/5' : 'border-emerald-400/40 bg-emerald-400/5'
          }`}
        >
          {result.breached ? (
            <>
              <p className="text-lg font-bold text-red-300">
                ⚠️ Found in {result.count.toLocaleString()} known breaches
              </p>
              <p className="mt-2 text-sm text-slate-300">
                This password is compromised and actively used in credential-stuffing attacks. Don&apos;t
                use it anywhere - pick something unique and, ideally, use a password manager.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-emerald-300">✅ Not found in any known breach</p>
              <p className="mt-2 text-sm text-slate-300">
                This password hasn&apos;t shown up in HaveIBeenPwned&apos;s breach corpus. That&apos;s a
                good sign - but uniqueness and length still matter most.
              </p>
            </>
          )}
        </div>
      )}

      <div className="mt-10 max-w-2xl rounded-2xl border border-white/10 bg-ink-900/40 p-5 text-sm text-slate-400">
        <p className="section-label mb-2">How it stays private</p>
        Your browser computes <code className="font-mono text-accent">SHA-1(password)</code>, then
        sends only the first 5 hex characters to my API, which relays them to HaveIBeenPwned. That
        prefix matches hundreds of hashes, so no one - not HIBP, not my server - can tell which
        password you checked. The final match happens locally in your browser.
      </div>
    </div>
  );
}
