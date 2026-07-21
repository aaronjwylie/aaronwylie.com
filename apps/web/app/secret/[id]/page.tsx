'use client';

import { useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiUrl } from '@/lib/api';
import { decryptSecret } from '@/lib/crypto';

export default function RevealSecretPage() {
  const params = useParams<{ id: string }>();
  const [state, setState] = useState<'idle' | 'loading' | 'shown' | 'gone'>('idle');
  const [value, setValue] = useState('');
  const [copied, setCopied] = useState(false);
  const consumed = useRef(false);

  async function reveal() {
    if (consumed.current) return;
    consumed.current = true;
    setState('loading');
    const key = window.location.hash.slice(1);
    if (!key) {
      setState('gone');
      return;
    }
    try {
      const res = await fetch(`${apiUrl}/secrets/${params.id}/consume`, { method: 'POST' });
      if (!res.ok) {
        setState('gone');
        return;
      }
      const { ciphertext, iv } = await res.json();
      setValue(await decryptSecret(ciphertext, iv, key));
      setState('shown');
    } catch {
      setState('gone');
    }
  }

  return (
    <div className="container-page py-24">
      <div className="card mx-auto max-w-lg">
        {state === 'idle' && (
          <div className="text-center">
            <p className="section-label mb-3">You&apos;ve received a one-time secret</p>
            <p className="mb-6 text-slate-400">
              It can be viewed <strong className="text-white">only once</strong>. Revealing it
              destroys it - so make sure you&apos;re ready to copy it.
            </p>
            <button onClick={reveal} className="btn-primary">
              Reveal secret
            </button>
          </div>
        )}

        {state === 'loading' && <p className="text-center text-slate-400">Decrypting…</p>}

        {state === 'shown' && (
          <div>
            <p className="section-label mb-2 text-emerald-300">The secret (now destroyed)</p>
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-ink-950 p-4 font-mono text-sm text-white">
              {value}
            </pre>
            <button
              onClick={() =>
                navigator.clipboard.writeText(value).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                })
              }
              className="btn-ghost mt-4"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <p className="mt-4 text-xs text-slate-500">
              This secret has been permanently deleted from the server. Reloading won&apos;t bring it
              back.
            </p>
          </div>
        )}

        {state === 'gone' && (
          <div className="text-center">
            <p className="mb-2 text-lg font-bold text-white">This secret isn&apos;t available</p>
            <p className="mb-6 text-slate-400">
              It&apos;s already been viewed, has expired, or the link is incomplete. One-time secrets
              can only be opened once.
            </p>
            <Link href="/tools/secret" className="btn-primary">
              Create your own
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
