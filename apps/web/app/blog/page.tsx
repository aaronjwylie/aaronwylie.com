import type { Metadata } from 'next';
import Link from 'next/link';
import { POSTS } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Writing',
  description:
    'Articles on full-stack development, backend, real-time systems, security and observability - by Aaron Wylie, a Vancouver-based full-stack developer.',
  alternates: { canonical: '/blog' },
};

function fmtDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default function BlogPage() {
  return (
    <div className="container-page py-16">
      <p className="section-label mb-4">Writing</p>
      <h1 className="mb-3 text-4xl font-extrabold text-white">Articles</h1>
      <p className="mb-10 max-w-2xl text-lg text-slate-400">
        Notes on full-stack development, backend, real-time systems, security and observability -
        drawn from real projects.
      </p>

      <div className="space-y-4">
        {POSTS.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card group block">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-bold text-white group-hover:text-accent">{p.title}</h2>
              <time className="shrink-0 text-xs text-slate-500">{fmtDate(p.date)}</time>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
