'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiUrl } from '@/lib/api';

interface Saved {
  code: string;
  shortUrl: string;
  url: string;
}
interface Analytics {
  code: string;
  url: string;
  createdAt: string;
  clicks: number;
  clicksByDay: { day: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
}

const LS_KEY = 'aw_short_links';

export default function ShortenerPage() {
  const [url, setUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<Saved[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [stats, setStats] = useState<Analytics | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLinks(JSON.parse(localStorage.getItem(LS_KEY) ?? '[]'));
    } catch {
      /* ignore */
    }
  }, []);

  const save = (next: Saved[]) => {
    setLinks(next);
    localStorage.setItem(LS_KEY, JSON.stringify(next.slice(0, 25)));
  };

  const loadStats = useCallback(async (code: string) => {
    try {
      const res = await fetch(`${apiUrl}/links/${code}`, { cache: 'no-store' });
      if (res.ok) setStats(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!selected) return;
    loadStats(selected);
    const t = setInterval(() => loadStats(selected), 10_000);
    return () => clearInterval(t);
  }, [selected, loadStats]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/shorten`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      const entry: Saved = { code: data.code, shortUrl: data.shortUrl, url: data.url };
      save([entry, ...links.filter((l) => l.code !== entry.code)]);
      setSelected(entry.code);
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setCreating(false);
    }
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  const maxDay = stats ? Math.max(1, ...stats.clicksByDay.map((d) => d.count)) : 1;

  return (
    <div className="container-page py-16">
      <p className="section-label mb-4">Tools</p>
      <h1 className="mb-3 text-4xl font-extrabold text-white">URL Shortener</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        Shorten a link and watch the clicks roll in - total clicks, a 7-day trend and top referrers,
        computed in SQL by my API. Links show a safe preview of their destination before redirecting.
      </p>

      <form onSubmit={onCreate} className="mb-4 flex max-w-xl flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/a/very/long/link"
          className="flex-1 rounded-lg border border-white/10 bg-ink-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
        />
        <button type="submit" disabled={creating} className="btn-primary px-6 py-3 disabled:opacity-60">
          {creating ? 'Shortening…' : 'Shorten'}
        </button>
      </form>
      {error && <p className="mb-6 text-sm text-red-400">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Your links */}
        <div>
          <p className="section-label mb-3">Your links</p>
          {links.length === 0 ? (
            <p className="text-sm text-slate-500">No links yet - shorten one above.</p>
          ) : (
            <div className="space-y-2">
              {links.map((l) => (
                <div
                  key={l.code}
                  className={`card cursor-pointer !p-4 ${selected === l.code ? 'border-accent/50' : ''}`}
                  onClick={() => setSelected(l.code)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <code className="font-mono text-sm text-accent">/s/{l.code}</code>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copy(l.shortUrl);
                      }}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      {copied === l.shortUrl ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">{l.url}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Analytics */}
        <div>
          <p className="section-label mb-3">Analytics</p>
          {!stats ? (
            <p className="text-sm text-slate-500">Select a link to see its stats.</p>
          ) : (
            <div className="card">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="gradient-text text-3xl font-extrabold">{stats.clicks}</div>
                  <div className="text-xs text-slate-500">total clicks</div>
                </div>
                <a href={stats.url} target="_blank" rel="noreferrer" className="max-w-[55%] truncate text-xs text-accent hover:underline">
                  {stats.url}
                </a>
              </div>

              <p className="section-label mb-2 mt-5">Last 7 days</p>
              <div className="flex h-16 items-end gap-1.5">
                {stats.clicksByDay.length === 0 && <span className="text-xs text-slate-600">No clicks yet.</span>}
                {stats.clicksByDay.map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1" title={`${d.day}: ${d.count}`}>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-accent-violet to-accent-cyan"
                      style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: 2 }}
                    />
                    <span className="text-[9px] text-slate-600">{d.day.slice(5)}</span>
                  </div>
                ))}
              </div>

              {stats.topReferrers.length > 0 && (
                <>
                  <p className="section-label mb-2 mt-5">Top referrers</p>
                  <ul className="space-y-1 text-sm">
                    {stats.topReferrers.map((r) => (
                      <li key={r.referrer} className="flex justify-between text-slate-400">
                        <span className="truncate">{r.referrer}</span>
                        <span className="text-slate-300">{r.count}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
