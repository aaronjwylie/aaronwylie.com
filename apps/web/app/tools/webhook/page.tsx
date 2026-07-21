'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { apiUrl } from '@/lib/api';

interface CapturedRequest {
  id: string;
  method: string;
  path: string;
  query: Record<string, unknown>;
  headers: Record<string, unknown>;
  body: string;
  ip: string;
  at: string;
}

function methodColor(m: string): string {
  return (
    {
      GET: 'text-sky-300 bg-sky-400/10 border-sky-400/30',
      POST: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30',
      PUT: 'text-amber-300 bg-amber-400/10 border-amber-400/30',
      PATCH: 'text-amber-300 bg-amber-400/10 border-amber-400/30',
      DELETE: 'text-red-300 bg-red-400/10 border-red-400/30',
    }[m] ?? 'text-slate-300 bg-white/5 border-white/20'
  );
}

export default function WebhookPage() {
  const [binId, setBinId] = useState<string | null>(null);
  const [requests, setRequests] = useState<CapturedRequest[]>([]);
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const captureUrl = binId ? `${apiUrl}/h/${binId}` : '';

  // Create a bin on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiUrl}/hooks`, { method: 'POST' });
        const data = await res.json();
        if (!cancelled) setBinId(data.id);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Connect the WebSocket once we have a bin.
  useEffect(() => {
    if (!binId) return;
    const wsUrl = `${apiUrl.replace(/^http/, 'ws')}/hooks/${binId}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'snapshot') setRequests(msg.requests ?? []);
        else if (msg.type === 'request') setRequests((prev) => [msg.request, ...prev].slice(0, 50));
      } catch {
        /* ignore */
      }
    };
    return () => ws.close();
  }, [binId]);

  const copy = useCallback(() => {
    if (!captureUrl) return;
    navigator.clipboard.writeText(captureUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [captureUrl]);

  const sendTest = useCallback(async () => {
    if (!captureUrl) return;
    await fetch(captureUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-demo': 'from-the-webhook-tool' },
      body: JSON.stringify({ hello: 'world', ts: new Date().toISOString() }),
    }).catch(() => {});
  }, [captureUrl]);

  return (
    <div className="container-page py-16">
      <p className="section-label mb-4">Tools</p>
      <h1 className="mb-3 text-4xl font-extrabold text-white">Webhook / Request Inspector</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        Get a unique URL and watch HTTP requests land on it in real time - method, headers, query and
        body - streamed to your browser over a <strong className="text-slate-200">WebSocket</strong>.
        Point a webhook or a <code className="font-mono text-accent">curl</code> at it to test integrations.
      </p>

      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <p className="section-label">Your capture URL</p>
          <span className={`text-xs ${connected ? 'text-emerald-400' : 'text-slate-500'}`}>
            {connected ? '● live' : '○ connecting…'}
          </span>
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <code className="flex-1 overflow-x-auto rounded-lg border border-white/10 bg-ink-950 px-4 py-3 font-mono text-sm text-accent">
            {captureUrl || 'creating…'}
          </code>
          <button onClick={copy} className="btn-ghost shrink-0" disabled={!captureUrl}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={sendTest} className="btn-primary shrink-0" disabled={!captureUrl}>
            Send test request
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Try it from a terminal:{' '}
          <code className="font-mono text-slate-400">curl -X POST {captureUrl || '…'} -d &apos;hi&apos;</code>
          {'  '}· bin auto-expires after 2 hours.
        </p>
      </div>

      <p className="section-label mb-3">
        Captured requests {requests.length > 0 && <span className="text-slate-500">({requests.length})</span>}
      </p>
      {requests.length === 0 ? (
        <div className="card text-slate-400">
          Waiting for the first request… send one with the button above or point any webhook at your URL.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <details key={r.id} className="card">
              <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                <span className={`rounded-md border px-2 py-0.5 font-mono text-xs font-bold ${methodColor(r.method)}`}>
                  {r.method}
                </span>
                <span className="font-mono text-sm text-slate-300">{r.path}</span>
                <span className="ml-auto text-xs text-slate-500">
                  {new Date(r.at).toLocaleTimeString()} · {r.ip}
                </span>
              </summary>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <p className="section-label mb-2">Headers</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <tbody>
                        {Object.entries(r.headers).map(([k, v]) => (
                          <tr key={k} className="border-t border-white/5">
                            <td className="py-1 pr-4 font-mono text-accent">{k}</td>
                            <td className="break-all py-1 text-slate-300">{String(v)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {r.body && (
                  <div>
                    <p className="section-label mb-2">Body</p>
                    <pre className="overflow-x-auto rounded-lg bg-ink-950 p-3 font-mono text-xs text-slate-300">
                      {r.body}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
