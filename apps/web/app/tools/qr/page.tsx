'use client';

import { useState } from 'react';
import { apiUrl } from '@/lib/api';

export default function QrPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);

  const svgDataUri = svg ? `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` : '';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setSvg(null);
    try {
      const res = await fetch(`${apiUrl}/qr`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
      setSvg(data.svg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function download(href: string, name: string) {
    const a = document.createElement('a');
    a.href = href;
    a.download = name;
    a.click();
  }

  function downloadPng() {
    if (!svg) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      download(canvas.toDataURL('image/png'), 'qr.png');
    };
    img.src = svgDataUri;
  }

  return (
    <div className="container-page py-16">
      <p className="section-label mb-4">Tools</p>
      <h1 className="mb-3 text-4xl font-extrabold text-white">QR Code Generator</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        Turn any URL or text into a QR code, generated server-side as a crisp SVG. Download it as SVG
        or PNG.
      </p>

      <form onSubmit={onSubmit} className="mb-10 flex max-w-xl flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://aaronwylie.com  or  any text"
          className="flex-1 rounded-lg border border-white/10 bg-ink-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-accent focus:outline-none"
        />
        <button type="submit" disabled={loading} className="btn-primary px-6 py-3 disabled:opacity-60">
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </form>

      {error && <div className="card max-w-xl border-red-400/40 bg-red-400/5 text-red-300">{error}</div>}

      {svg && (
        <div className="card w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={svgDataUri} alt="QR code" width={256} height={256} className="rounded-lg bg-white p-3" />
          <div className="mt-4 flex gap-3">
            <button
              onClick={() =>
                download(
                  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
                  'qr.svg',
                )
              }
              className="btn-ghost"
            >
              Download SVG
            </button>
            <button onClick={downloadPng} className="btn-ghost">
              Download PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
