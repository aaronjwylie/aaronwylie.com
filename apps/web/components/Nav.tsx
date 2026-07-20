import Link from 'next/link';
import { apiUrl } from '@/lib/api';

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/80 backdrop-blur">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="font-mono text-sm font-bold text-white">
          <span className="text-accent">$</span> your-name
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/#projects" className="text-slate-300 hover:text-white">
            Projects
          </Link>
          <Link href="/architecture" className="text-slate-300 hover:text-white">
            Architecture
          </Link>
          <a
            href={`${apiUrl}/docs`}
            target="_blank"
            rel="noreferrer"
            className="text-slate-300 hover:text-white"
          >
            API Docs ↗
          </a>
          <Link href="/#contact" className="btn-primary">
            Contact
          </Link>
        </div>
      </nav>
    </header>
  );
}
