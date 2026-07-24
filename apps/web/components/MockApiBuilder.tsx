'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiUrl } from '@/lib/api';

interface Field {
  name: string;
  type: string;
}
interface CatalogItem {
  key: string;
  label: string;
}
interface CreatedResource {
  name: string;
  count: number;
  list: string;
  item: string;
}
interface CreateResult {
  id: string;
  baseUrl: string;
  expiresAt: string;
  resources: CreatedResource[];
}

const LS_KEY = 'aw_mock_apis';

const TEMPLATES: Record<string, { count: number; fields: Field[] }> = {
  users: {
    count: 25,
    fields: [
      { name: 'id', type: 'id' },
      { name: 'name', type: 'fullName' },
      { name: 'email', type: 'email' },
      { name: 'username', type: 'username' },
      { name: 'avatar', type: 'avatar' },
      { name: 'company', type: 'company' },
      { name: 'active', type: 'boolean' },
      { name: 'createdAt', type: 'datetime' },
    ],
  },
  products: {
    count: 25,
    fields: [
      { name: 'id', type: 'id' },
      { name: 'name', type: 'productName' },
      { name: 'price', type: 'price' },
      { name: 'stock', type: 'number' },
      { name: 'image', type: 'imageUrl' },
      { name: 'inStock', type: 'boolean' },
      { name: 'description', type: 'sentence' },
    ],
  },
  posts: {
    count: 20,
    fields: [
      { name: 'id', type: 'id' },
      { name: 'title', type: 'sentence' },
      { name: 'body', type: 'paragraph' },
      { name: 'authorId', type: 'number' },
      { name: 'publishedAt', type: 'datetime' },
    ],
  },
  orders: {
    count: 30,
    fields: [
      { name: 'id', type: 'id' },
      { name: 'reference', type: 'uuid' },
      { name: 'total', type: 'price' },
      { name: 'quantity', type: 'number' },
      { name: 'paid', type: 'boolean' },
      { name: 'city', type: 'city' },
      { name: 'orderedAt', type: 'datetime' },
    ],
  },
};

export function MockApiBuilder() {
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [resource, setResource] = useState('users');
  const [count, setCount] = useState(25);
  const [fields, setFields] = useState<Field[]>(TEMPLATES.users!.fields);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResult | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);
  const [recent, setRecent] = useState<CreateResult[]>([]);

  useEffect(() => {
    fetch(`${apiUrl}/mock/field-types`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setCatalog(d.fields ?? []))
      .catch(() => {});
    try {
      setRecent(JSON.parse(localStorage.getItem(LS_KEY) ?? '[]'));
    } catch {
      /* ignore */
    }
  }, []);

  const applyTemplate = (key: string) => {
    const t = TEMPLATES[key];
    if (!t) return;
    setResource(key);
    setCount(t.count);
    setFields(t.fields.map((f) => ({ ...f })));
    setResult(null);
    setPreview('');
  };

  const setField = (i: number, patch: Partial<Field>) =>
    setFields((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const addField = () => setFields((prev) => [...prev, { name: `field${prev.length + 1}`, type: 'word' }]);
  const removeField = (i: number) => setFields((prev) => prev.filter((_, idx) => idx !== i));

  const copy = useCallback((text: string, tag: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(tag);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);

  async function create() {
    setCreating(true);
    setError(null);
    setPreview('');
    try {
      const res = await fetch(`${apiUrl}/mock`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ resources: [{ name: resource, count: Number(count), fields }] }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || `Request failed (${res.status})`);
      }
      const data: CreateResult = await res.json();
      setResult(data);
      const next = [data, ...recent.filter((r) => r.id !== data.id)].slice(0, 8);
      setRecent(next);
      localStorage.setItem(LS_KEY, JSON.stringify(next));

      // Live preview of the first few records.
      const first = data.resources[0];
      if (first) {
        const p = await fetch(`${first.list}?limit=5`, { cache: 'no-store' });
        setPreview(JSON.stringify(await p.json(), null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setCreating(false);
    }
  }

  const listUrl = result?.resources[0]?.list ?? '';
  const itemUrl = result?.resources[0]?.item ?? '';

  return (
    <div className="space-y-8">
      {/* Builder */}
      <div className="card">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="section-label mr-1">Start from a template</span>
          {Object.keys(TEMPLATES).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => applyTemplate(k)}
              className={`chip capitalize ${resource === k ? 'border-accent/50 text-accent' : 'hover:border-white/25'}`}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-300">Resource name</span>
            <input
              value={resource}
              onChange={(e) => setResource(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 font-mono text-white focus:border-accent focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-300">Number of records (1-1000)</span>
            <input
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(e) => setCount(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))}
              className="w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-white focus:border-accent focus:outline-none"
            />
          </label>
        </div>

        <p className="section-label mb-2">Fields</p>
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={f.name}
                onChange={(e) => setField(i, { name: e.target.value })}
                placeholder="field name"
                className="w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 font-mono text-sm text-white focus:border-accent focus:outline-none"
              />
              <select
                value={f.type}
                onChange={(e) => setField(i, { type: e.target.value })}
                className="w-56 shrink-0 rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none"
              >
                {catalog.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeField(i)}
                aria-label="Remove field"
                className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-slate-400 hover:border-rose-500/50 hover:text-rose-400"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={addField} className="btn-ghost">
            + Add field
          </button>
          <button type="button" onClick={create} disabled={creating || fields.length === 0} className="btn-primary disabled:opacity-60">
            {creating ? 'Creating…' : 'Create mock API'}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
      </div>

      {/* Result */}
      {result && (
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <h3 className="text-lg font-bold text-white">Your API is live</h3>
          </div>

          <p className="mb-2 text-sm text-slate-400">Base URL</p>
          <div className="mb-5 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-sm text-accent-cyan">
              {result.baseUrl}
            </code>
            <button type="button" onClick={() => copy(result.baseUrl, 'base')} className="btn-ghost shrink-0">
              {copied === 'base' ? 'Copied' : 'Copy'}
            </button>
          </div>

          <p className="mb-2 text-sm text-slate-400">Endpoints</p>
          <div className="mb-5 space-y-2 text-sm">
            <EndpointRow method="GET" url={listUrl} note="list all" onCopy={() => copy(listUrl, 'list')} copied={copied === 'list'} />
            <EndpointRow method="GET" url={itemUrl} note="one record" onCopy={() => copy(itemUrl, 'item')} copied={copied === 'item'} />
            <EndpointRow method="GET" url={`${listUrl}?page=1&limit=10`} note="paginate" />
            <EndpointRow method="GET" url={`${listUrl}?sortBy=id&order=desc`} note="sort" />
            <EndpointRow method="GET" url={`${listUrl}?search=term`} note="search" />
          </div>

          <p className="mb-2 text-sm text-slate-400">Try it with curl</p>
          <div className="mb-5 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-sm text-slate-300">
              curl {listUrl}
            </code>
            <button type="button" onClick={() => copy(`curl ${listUrl}`, 'curl')} className="btn-ghost shrink-0">
              {copied === 'curl' ? 'Copied' : 'Copy'}
            </button>
          </div>

          {preview && (
            <>
              <p className="mb-2 text-sm text-slate-400">Live response (first 5 records)</p>
              <pre className="max-h-96 overflow-auto rounded-lg border border-white/10 bg-ink-950 p-4 text-xs leading-relaxed text-slate-300">
                {preview}
              </pre>
            </>
          )}

          <p className="mt-4 text-xs text-slate-500">
            Supports GET (real data) plus POST / PUT / PATCH / DELETE (simulated - they echo back, nothing
            persists). CORS is open, so call it from any app. Expires after 7 days of inactivity.
          </p>
          <a href={listUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-medium text-accent hover:underline">
            Open the endpoint in a new tab →
          </a>
        </div>
      )}

      {/* Recent (return-visit stickiness) */}
      {recent.length > 0 && (
        <div className="card">
          <p className="section-label mb-3">Your recent mocks (this browser)</p>
          <ul className="space-y-2 text-sm">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3">
                <code className="truncate text-slate-300">
                  {r.resources.map((x) => x.name).join(', ')} · {r.baseUrl}
                </code>
                <a href={r.resources[0]?.list} target="_blank" rel="noreferrer" className="shrink-0 text-accent hover:underline">
                  open →
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EndpointRow({
  method,
  url,
  note,
  onCopy,
  copied,
}: {
  method: string;
  url: string;
  note: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 rounded bg-emerald-500/15 px-2 py-1 text-center text-xs font-semibold text-emerald-300">
        {method}
      </span>
      <code className="flex-1 overflow-x-auto rounded-lg border border-white/10 bg-ink-950 px-3 py-1.5 text-xs text-slate-300">
        {url}
      </code>
      <span className="w-20 shrink-0 text-right text-xs text-slate-500">{note}</span>
      {onCopy && (
        <button type="button" onClick={onCopy} className="shrink-0 text-xs text-accent hover:underline">
          {copied ? 'Copied' : 'Copy'}
        </button>
      )}
    </div>
  );
}
