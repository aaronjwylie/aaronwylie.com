'use client';

import { useMemo, useState } from 'react';
import { apiUrl } from '@/lib/api';

// Canonical jwt.io sample (HS256; verifies with secret "your-256-bit-secret").
const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

function b64urlDecode(seg: string): string {
  const pad = seg.length % 4 === 0 ? '' : '='.repeat(4 - (seg.length % 4));
  const b64 = seg.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return decodeURIComponent(
    atob(b64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join(''),
  );
}

function fmtTime(unix: number) {
  return new Date(unix * 1000).toISOString().replace('T', ' ').replace('.000Z', ' UTC');
}

interface Decoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  error?: string;
}

export default function JwtPage() {
  const [token, setToken] = useState('');
  const [secret, setSecret] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [verify, setVerify] = useState<{ verified: boolean; reason: string | null; alg: string } | null>(null);
  const [verifying, setVerifying] = useState(false);

  const decoded: Decoded | null = useMemo(() => {
    const t = token.trim();
    if (!t) return null;
    const parts = t.split('.');
    if (parts.length !== 3) return { header: {}, payload: {}, error: 'A JWT has three dot-separated parts.' };
    try {
      return { header: JSON.parse(b64urlDecode(parts[0]!)), payload: JSON.parse(b64urlDecode(parts[1]!)) };
    } catch {
      return { header: {}, payload: {}, error: 'Could not decode - is this a valid JWT?' };
    }
  }, [token]);

  const alg = String(decoded?.header?.alg ?? '');
  const isHmac = alg.startsWith('HS');
  const exp = typeof decoded?.payload?.exp === 'number' ? (decoded.payload.exp as number) : null;
  const expired = exp !== null && exp * 1000 < Date.now();

  async function runVerify() {
    setVerifying(true);
    setVerify(null);
    try {
      const res = await fetch(`${apiUrl}/jwt/verify`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), secret: secret || undefined, publicKey: publicKey || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setVerify(data);
    } catch (e) {
      setVerify({ verified: false, reason: e instanceof Error ? e.message : 'Verification failed', alg });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="container-page py-16">
      <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">JWT Decoder &amp; Verifier</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        Paste a JSON Web Token to decode its header and payload and check expiry. Decoding happens
        entirely in your browser; signature verification is optional.
      </p>

      <div className="card mb-6">
        <div className="mb-2 flex items-center justify-between">
          <p className="section-label">Token</p>
          <button onClick={() => setToken(SAMPLE)} className="text-xs text-accent hover:underline">
            Use a sample
          </button>
        </div>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOi..."
          className="h-28 w-full resize-y rounded-lg border border-white/10 bg-ink-950 p-3 font-mono text-sm text-accent-cyan focus:border-accent focus:outline-none"
        />
      </div>

      {decoded?.error && <div className="card mb-6 text-sm text-amber-400">{decoded.error}</div>}

      {decoded && !decoded.error && (
        <>
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div className="card">
              <p className="section-label mb-2">Header</p>
              <pre className="overflow-auto rounded-lg bg-ink-950 p-3 text-xs text-slate-200">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>
            <div className="card">
              <p className="section-label mb-2">Payload</p>
              <pre className="overflow-auto rounded-lg bg-ink-950 p-3 text-xs text-slate-200">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>
          </div>

          <div className="card mb-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <span className="text-slate-400">
              Algorithm: <span className="font-mono text-white">{alg || 'unknown'}</span>
            </span>
            {exp !== null && (
              <span className={expired ? 'text-rose-400' : 'text-emerald-400'}>
                {expired ? 'Expired' : 'Expires'} {fmtTime(exp)}
              </span>
            )}
            {typeof decoded.payload.iat === 'number' && (
              <span className="text-slate-400">Issued {fmtTime(decoded.payload.iat as number)}</span>
            )}
          </div>

          <div className="card">
            <p className="section-label mb-3">Verify signature (optional)</p>
            {alg === 'none' ? (
              <p className="text-sm text-amber-400">This token uses &ldquo;none&rdquo; - it is unsigned.</p>
            ) : isHmac ? (
              <input
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="Shared secret (for HS256/384/512)"
                className="mb-3 w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 font-mono text-sm text-white focus:border-accent focus:outline-none"
              />
            ) : (
              <textarea
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="-----BEGIN PUBLIC KEY-----&#10;... (PEM, for RS/ES/PS)"
                className="mb-3 h-28 w-full resize-y rounded-lg border border-white/10 bg-ink-950 p-3 font-mono text-xs text-white focus:border-accent focus:outline-none"
              />
            )}
            <div className="flex items-center gap-4">
              <button onClick={runVerify} disabled={verifying || alg === 'none'} className="btn-primary disabled:opacity-60">
                {verifying ? 'Verifying…' : 'Verify'}
              </button>
              {verify && (
                <span className={`text-sm font-semibold ${verify.verified ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {verify.verified ? '✓ Signature valid' : `✗ ${verify.reason ?? 'Not verified'}`}
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
