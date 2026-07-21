import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { CASE_STUDIES, getCaseStudy } from '@/lib/caseStudies';

const SITE_URL = 'https://aaronwylie.com';

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const study = getCaseStudy(params.slug);
  if (!study) return {};
  return {
    title: `${study.title} - Case Study`,
    description: study.description,
    keywords: study.tags,
    alternates: { canonical: `/projects/${study.slug}` },
    openGraph: {
      type: 'article',
      title: study.title,
      description: study.description,
      url: `${SITE_URL}/projects/${study.slug}`,
    },
  };
}

export default function CaseStudyPage({ params }: { params: { slug: string } }) {
  const study = getCaseStudy(params.slug);
  if (!study) notFound();

  const file = path.join(process.cwd(), 'content', 'projects', `${study.slug}.md`);
  const markdown = fs.readFileSync(file, 'utf8');
  const html = marked.parse(markdown) as string;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: study.title,
    description: study.description,
    keywords: study.tags.join(', '),
    author: { '@type': 'Person', name: 'Aaron Wylie', url: SITE_URL },
    url: `${SITE_URL}/projects/${study.slug}`,
    inLanguage: 'en-CA',
  };

  return (
    <div className="container-page py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/#projects" className="text-sm text-slate-400 hover:text-accent">
        ← All projects
      </Link>

      <article className="mt-6">
        <p className="section-label mb-3">Case study</p>
        <h1 className="mb-4 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
          {study.title}
        </h1>
        <div className="mb-8 flex flex-wrap gap-2">
          {study.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
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
        <Link href="/#projects" className="btn-ghost">
          More projects
        </Link>
      </div>
    </div>
  );
}
