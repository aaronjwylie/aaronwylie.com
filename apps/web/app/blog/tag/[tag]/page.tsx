import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allTags, postsByTag, tagFromSlug } from '@/lib/posts';
import { readingTimeMinutes } from '@/lib/reading';

export function generateStaticParams() {
  return allTags().map((t) => ({ tag: t.slug }));
}

export function generateMetadata({ params }: { params: { tag: string } }): Metadata {
  const tag = tagFromSlug(params.tag);
  if (!tag) return {};
  return {
    title: `${tag} - Writing`,
    description: `Articles tagged ${tag} by Aaron Wylie, a Vancouver-based full-stack developer.`,
    alternates: { canonical: `/blog/tag/${params.tag}` },
  };
}

function fmtDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const tag = tagFromSlug(params.tag);
  const posts = postsByTag(params.tag);
  if (!tag || posts.length === 0) notFound();

  return (
    <div className="container-page py-16">
      <Link href="/blog" className="text-sm text-slate-400 hover:text-accent">
        ← All writing
      </Link>
      <p className="section-label mb-3 mt-6">Topic</p>
      <h1 className="mb-3 text-4xl font-extrabold text-white">{tag}</h1>
      <p className="mb-10 max-w-2xl text-slate-400">
        {posts.length} article{posts.length === 1 ? '' : 's'} tagged {tag}.
      </p>

      <div className="space-y-4">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card group block">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-xl font-bold text-white group-hover:text-accent">{p.title}</h2>
              <time className="shrink-0 text-xs text-slate-500">
                {fmtDate(p.date)} · {readingTimeMinutes(p.slug)} min read
              </time>
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
