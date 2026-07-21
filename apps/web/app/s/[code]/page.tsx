import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { AutoRedirect } from './AutoRedirect';

const SERVER_API =
  process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ShortRedirect({ params }: { params: { code: string } }) {
  const referer = headers().get('referer') ?? '';
  let url: string | null = null;
  try {
    const res = await fetch(`${SERVER_API}/links/${params.code}/hit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ referrer: referer }),
      cache: 'no-store',
    });
    if (res.ok) url = ((await res.json()) as { url: string }).url;
  } catch {
    /* fall through to not-found */
  }

  if (!url) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold text-white">Link not found</h1>
        <p className="mt-2 text-slate-400">This short link doesn&apos;t exist.</p>
        <Link href="/tools/shortener" className="btn-primary mt-6 inline-block">
          Make a short link
        </Link>
      </div>
    );
  }

  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    /* keep raw */
  }

  return (
    <div className="container-page py-24">
      <div className="card mx-auto max-w-lg text-center">
        <p className="section-label mb-3">You&apos;re being redirected to</p>
        <p className="mb-1 break-all text-xl font-bold text-white">{host}</p>
        <p className="mb-6 break-all text-xs text-slate-500">{url}</p>
        <a href={url} className="btn-primary">
          Continue →
        </a>
        <p className="mt-4 text-xs text-slate-500">
          Redirecting automatically in <AutoRedirect url={url} seconds={5} /> seconds…
        </p>
        <p className="mt-6 text-xs text-slate-600">
          This preview is shown so you always know where a short link leads.
        </p>
      </div>
    </div>
  );
}
