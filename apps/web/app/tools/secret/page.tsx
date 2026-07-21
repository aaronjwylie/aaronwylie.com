'use client';

import { useState } from 'react';
import { apiUrl } from '@/lib/api';
import { encryptSecret } from '@/lib/crypto';

export default function SecretPage() {
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!secret) return;
    setBusy(true);
    setError(null);
    try {
      const { ciphertext, iv, key } = await encryptSecret(secret);
      const res = await fetch(`${apiUrl}/secrets`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ciphertext, iv }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setLink(`${window.location.origin}/secret/${data.id}#${key}`);
      setSecret('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-page py-16">
      <p className="section-label mb-4">Tools</p>
      <h1 className="mb-3 text-4xl font-extrabold text-white">One-Time Secret</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        Share a password, API key or note as a link that <strong className="text-slate-200">self-destructs
        after one view</strong>. It&apos;s encrypted in your browser - the decryption key lives in the
        link&apos;s <code className="font-mono text-accent">#fragment</code> and never reaches my server,
        which only ever stores unreadable ciphertext.
      </p>

      {!link ? (
        <form onSubmit={onSubmit} className="max-w-xl">
          <textarea
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            rows={4}
            maxLength={5000}
            placeholder="Paste the secret to share…"
            className="w-full rounded-lg border border-white/10 bg-ink-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
          />
          {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary mt-3 px-6 py-3 disabled:opacity-60">
            {busy ? 'Encrypting…' : 'Create secret link'}
          </button>
        </form>
      ) : (
        <div className="card max-w-xl border-emerald-400/30 bg-emerald-400/5">
          <p className="section-label mb-2 text-emerald-300">Your one-time link</p>
          <code className="block overflow-x-auto rounded-lg border border-white/10 bg-ink-950 px-4 py-3 font-mono text-sm text-accent">
            {link}
          </code>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() =>
                navigator.clipboard.writeText(link).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                })
              }
              className="btn-primary"
            >
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <button onClick={() => setLink(null)} className="btn-ghost">
              Create another
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Share it over a trusted channel. It can be viewed <strong>once</strong>, then it&apos;s
            gone. Unread secrets auto-expire after 7 days.
          </p>
        </div>
      )}
    </div>
  );
}
