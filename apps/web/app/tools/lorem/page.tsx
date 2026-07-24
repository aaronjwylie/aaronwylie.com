'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiUrl } from '@/lib/api';

type Unit = 'paragraphs' | 'sentences' | 'words' | 'characters' | 'lists';
type Format = 'text' | 'html';
interface Stats {
  characters: number;
  words: number;
  paragraphs: number;
}

const UNIT_MAX: Record<Unit, number> = {
  paragraphs: 50,
  sentences: 200,
  words: 1000,
  characters: 50000,
  lists: 100,
};
const UNITS: Unit[] = ['paragraphs', 'sentences', 'words', 'characters', 'lists'];

export default function LoremPage() {
  const [unit, setUnit] = useState<Unit>('paragraphs');
  const [count, setCount] = useState(5);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [format, setFormat] = useState<Format>('text');
  const [text, setText] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nonce, setNonce] = useState(0);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        unit,
        count: String(count),
        startWithLorem: String(startWithLorem),
        format,
      });
      const res = await fetch(`${apiUrl}/lorem?${q}`, { cache: 'no-store' });
      const data = await res.json();
      setText(data.text ?? '');
      setStats(data.stats ?? null);
    } catch {
      setText('Could not reach the generator. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [unit, count, startWithLorem, format]);

  // Regenerate on any option change (debounced) or when the button bumps nonce.
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(generate, 200);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [generate, nonce]);

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const max = UNIT_MAX[unit];

  return (
    <div className="container-page py-16">
      <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">Lorem Ipsum Generator</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        Generate placeholder text however you need it - by paragraphs, sentences, words, characters or
        list items, as plain text or ready-to-paste HTML.
      </p>

      {/* Controls */}
      <div className="card mb-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-300">Amount</span>
            <input
              type="number"
              min={1}
              max={max}
              value={count}
              onChange={(e) => setCount(Math.min(max, Math.max(1, Number(e.target.value) || 1)))}
              className="w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-white focus:border-accent focus:outline-none"
            />
            <span className="mt-1 block text-xs text-slate-500">max {max.toLocaleString()}</span>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-300">Unit</span>
            <select
              value={unit}
              onChange={(e) => {
                const u = e.target.value as Unit;
                setUnit(u);
                setCount((c) => Math.min(c, UNIT_MAX[u]));
              }}
              className="w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-white focus:border-accent focus:outline-none"
            >
              {UNITS.map((u) => (
                <option key={u} value={u} className="capitalize">
                  {u}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-ink-950 accent-accent"
            />
            Start with &ldquo;Lorem ipsum…&rdquo;
          </label>

          <div className="flex items-center gap-1 rounded-lg border border-white/10 p-1">
            {(['text', 'html'] as Format[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition ${
                  format === f ? 'bg-accent/20 text-accent' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'html' ? 'HTML' : 'Text'}
              </button>
            ))}
          </div>

          <button type="button" onClick={() => setNonce((n) => n + 1)} className="btn-ghost">
            ↻ Regenerate
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="card">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            {stats ? (
              <>
                {stats.words.toLocaleString()} words · {stats.characters.toLocaleString()} characters
                {unit === 'paragraphs' && ` · ${stats.paragraphs} paragraphs`}
              </>
            ) : (
              'Generating…'
            )}
          </p>
          <button type="button" onClick={copy} disabled={!text} className="btn-primary disabled:opacity-60">
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <textarea
          readOnly
          value={text}
          className={`h-96 w-full resize-y rounded-lg border border-white/10 bg-ink-950 p-4 text-sm leading-relaxed text-slate-200 focus:outline-none ${
            format === 'html' ? 'font-mono' : ''
          } ${loading ? 'opacity-60' : ''}`}
        />
      </div>
    </div>
  );
}
