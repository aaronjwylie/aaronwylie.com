'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** "Back to all tools" link — shown on tool sub-pages, hidden on the index. */
export function BackToTools() {
  const pathname = usePathname();
  if (pathname === '/tools') return null;
  return (
    <div className="container-page pt-8">
      <Link
        href="/tools"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition hover:text-accent"
      >
        <span aria-hidden="true">←</span> All tools
      </Link>
    </div>
  );
}
