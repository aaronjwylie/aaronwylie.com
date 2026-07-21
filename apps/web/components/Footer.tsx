import { apiUrl } from '@/lib/api';

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="container-page flex flex-col items-center justify-between gap-4 text-sm text-slate-400 sm:flex-row">
        <p>
          Aaron Wylie · Full-stack developer in Vancouver, Canada - working remotely with clients
          worldwide. Built with TypeScript, Fastify, Next.js &amp; Postgres, rendered from a live API.
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
    </footer>
  );
}
