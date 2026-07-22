import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { POSTS, getPost, tagSlug } from '@/lib/posts';
import { readingTimeMinutes } from '@/lib/reading';

const SITE_URL = 'https://aaronwylie.com';

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: `${SITE_URL}/blog/${post.slug}`,
      publishedTime: post.date,
    },
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

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const file = path.join(process.cwd(), 'content', 'blog', `${post.slug}.md`);
  const markdown = fs.readFileSync(file, 'utf8');
  const html = marked.parse(markdown) as string;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    keywords: post.tags.join(', '),
    author: { '@type': 'Person', name: 'Aaron Wylie', url: SITE_URL },
    publisher: { '@type': 'Person', name: 'Aaron Wylie', url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    inLanguage: 'en-CA',
  };

  return (
    <div className="container-page py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/blog" className="text-sm text-slate-400 hover:text-accent">
        ← All writing
      </Link>

      <article className="mt-6">
        <p className="section-label mb-3">
          {fmtDate(post.date)} · {readingTimeMinutes(post.slug)} min read
        </p>
        <h1 className="mb-4 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
          {post.title}
        </h1>
        <div className="mb-8 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <Link key={t} href={`/blog/tag/${tagSlug(t)}`} className="chip hover:border-accent/40 hover:text-accent">
              {t}
            </Link>
          ))}
        </div>
        <div
          className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-accent prose-strong:text-white prose-code:text-accent prose-code:before:content-none prose-code:after:content-none prose-pre:border prose-pre:border-white/10 prose-pre:bg-ink-950"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </article>

      <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
        <Link href="/#contact" className="btn-primary">
          Get in touch
        </Link>
        <Link href="/blog" className="btn-ghost">
          More writing
        </Link>
      </div>
    </div>
  );
}
