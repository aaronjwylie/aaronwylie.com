'use client';

import { useState } from 'react';
import { apiUrl } from '@/lib/api';

type Header = { key: string; value: string };
interface Resp {
  status: number;
  statusText: string;
  timeMs: number;
  size: number;
  truncated: boolean;
  headers: Record<string, string>;
  body: string;
}

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

function statusColor(s: number) {
  if (s >= 200 && s < 300) return 'text-emerald-400';
  if (s >= 300 && s < 400) return 'text-sky-400';
  if (s >= 400 && s < 500) return 'text-amber-400';
  return 'text-rose-400';
}

function prettyBody(body: string, contentType?: string) {
  if (contentType?.includes('json')) {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      /* fall through */
    }
  }
  return body;
}

export default function HttpPage() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://api.github.com/zen');
  const [headers, setHeaders] = useState<Header[]>([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [resp, setResp] = useState<Resp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasBody = method !== 'GET' && method !== 'HEAD';
  const setHeader = (i: number, patch: Partial<Header>) =>
    setHeaders((prev) => prev.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));

  async function send() {
    setLoading(true);
    setError(null);
    setResp(null);
    try {
      const res = await fetch(`${apiUrl}/http/send`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          method,
          url,
          headers: headers.filter((h) => h.key.trim()),
          ...(hasBody && body ? { body } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed (${res.status})`);
      setResp(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-16">
      <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">HTTP Request Builder</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        A mini Postman: build any request, send it, and inspect the full response. Requests run
        server-side and are SSRF-safe (private hosts are refused).
      </p>

      <div className="card mb-6">
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="rounded-lg border border-white/10 bg-ink-950 px-3 py-2 font-mono text-sm font-semibold text-accent-cyan focus:border-accent focus:outline-none"
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="https://api.example.com/endpoint"
            className="flex-1 rounded-lg border border-white/10 bg-ink-950 px-3 py-2 font-mono text-sm text-white focus:border-accent focus:outline-none"
          />
          <button onClick={send} disabled={loading || !url} className="btn-primary disabled:opacity-60">
            {loading ? 'Sending…' : 'Send'}
          </button>
        </div>

        <p className="section-label mb-2 mt-5">Headers</p>
        <div className="space-y-2">
          {headers.map((h, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={h.key}
                onChange={(e) => setHeader(i, { key: e.target.value })}
                placeholder="Header"
                className="w-1/3 rounded-lg border border-white/10 bg-ink-950 px-3 py-1.5 font-mono text-sm text-white focus:border-accent focus:outline-none"
              />
              <input
                value={h.value}
                onChange={(e) => setHeader(i, { value: e.target.value })}
                placeholder="Value"
                className="flex-1 rounded-lg border border-white/10 bg-ink-950 px-3 py-1.5 font-mono text-sm text-white focus:border-accent focus:outline-none"
              />
              <button
                onClick={() => setHeaders((p) => p.filter((_, idx) => idx !== i))}
                className="shrink-0 rounded-lg border border-white/10 px-3 text-slate-400 hover:border-rose-500/50 hover:text-rose-400"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => setHeaders((p) => [...p, { key: '', value: '' }])} className="btn-ghost mt-3">
          + Add header
        </button>

        {hasBody && (
          <>
            <p className="section-label mb-2 mt-5">Request body</p>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{ "key": "value" }'
              className="h-32 w-full resize-y rounded-lg border border-white/10 bg-ink-950 p-3 font-mono text-sm text-white focus:border-accent focus:outline-none"
            />
          </>
        )}
      </div>

      {error && <div className="card mb-6 text-sm text-rose-400">{error}</div>}

      {resp && (
        <div className="card">
          <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <span className={`text-lg font-bold ${statusColor(resp.status)}`}>
              {resp.status} {resp.statusText}
            </span>
            <span className="text-slate-400">{resp.timeMs} ms</span>
            <span className="text-slate-400">{resp.size.toLocaleString()} bytes</span>
          </div>

          <p className="section-label mb-2">Response headers</p>
          <div className="mb-5 max-h-40 overflow-auto rounded-lg border border-white/10 bg-ink-950 p-3 font-mono text-xs text-slate-300">
            {Object.entries(resp.headers).map(([k, v]) => (
              <div key={k}>
                <span className="text-accent-cyan">{k}</span>: {v}
              </div>
            ))}
          </div>

          <p className="section-label mb-2">Body {resp.truncated && <span className="text-slate-500">(truncated)</span>}</p>
          <pre className="max-h-[28rem] overflow-auto rounded-lg border border-white/10 bg-ink-950 p-4 text-xs leading-relaxed text-slate-200">
            {prettyBody(resp.body, resp.headers['content-type'])}
          </pre>
        </div>
      )}
    </div>
  );
}
