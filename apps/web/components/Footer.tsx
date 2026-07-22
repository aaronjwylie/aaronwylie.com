import Link from 'next/link';
import { apiUrl } from '@/lib/api';

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="container-page flex flex-col gap-6">
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-400 sm:flex-row">
          <p>
            Aaron Wylie · Full-stack developer in Vancouver, Canada - working remotely with clients
            worldwide.
            <br />
            Site built with TypeScript, Fastify, Next.js &amp; Postgres, rendered from a live API.
          </p>
          <div className="flex gap-4">
            <a href={`${apiUrl}/health`} target="_blank" rel="noreferrer" className="hover:text-accent">
              /health
            </a>
            <a href={`${apiUrl}/metrics`} target="_blank" rel="noreferrer" className="hover:text-accent">
              /metrics
            </a>
            <a href={`${apiUrl}/docs`} target="_blank" rel="noreferrer" className="hover:text-accent">
              /docs
            </a>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/5 pt-5 text-sm text-slate-500">
          <Link href="/blog" className="hover:text-accent">Writing</Link>
          <Link href="/tools" className="hover:text-accent">Tools</Link>
          <Link href="/status" className="hover:text-accent">Live status</Link>
          <Link href="/faq" className="hover:text-accent">FAQ</Link>
          <Link href="/uses" className="hover:text-accent">Uses</Link>
          <Link href="/resume" className="hover:text-accent">Résumé</Link>
          <Link href="/privacy" className="hover:text-accent">Privacy</Link>
          <a href="/rss.xml" className="hover:text-accent">RSS</a>
        </nav>
      </div>
    </footer>
  );
}
