import type { Metadata } from 'next';
import { apiUrl } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Architecture - How this site works',
  description: 'The system design behind this portfolio: Fastify API, Postgres, Docker, CI/CD.',
};

const layers = [
  {
    title: 'Web - Next.js (App Router)',
    points: [
      'Server Components fetch from the API at request time, so pages render from live data.',
      'Tailwind for styling; ships as a minimal standalone server in Docker.',
      'The contact form POSTs directly to the API and shows real success/error states.',
    ],
  },
  {
    title: 'API - Fastify + TypeScript',
    points: [
      'Zod schemas are the single source of truth: they validate input, serialize output, and generate the OpenAPI docs.',
      'Rate limiting, Helmet security headers and CORS are configured per environment.',
      'Structured JSON logging (pino) with a request id on every log line.',
      'Prometheus metrics at /metrics and liveness/readiness probes at /health and /ready.',
    ],
  },
  {
    title: 'Data - Postgres via Drizzle ORM',
    points: [
      'Type-safe, SQL-first schema and queries - no hidden magic, migrations are plain SQL in version control.',
      'Projects, contact messages and page-view analytics each get a purpose-built table and indexes.',
      'Aggregates (visitor stats) are computed in SQL, not in application code.',
    ],
  },
  {
    title: 'Infra - Docker + CI/CD',
    points: [
      'Multi-stage Dockerfiles produce small production images for both apps.',
      'docker-compose runs API, web and Postgres together; an nginx reverse proxy terminates TLS.',
      'GitHub Actions runs typecheck, tests (against a real Postgres) and builds on every push.',
      'Deployable to any Docker host - DigitalOcean, Hetzner, Fly, or bare metal - with no code changes.',
    ],
  },
];

function Node({
  title,
  subtitle,
  gradient,
}: {
  title: string;
  subtitle: string;
  gradient: string;
}) {
  return (
    <div className="w-full rounded-xl border border-white/10 bg-ink-800/60 p-4 text-center transition hover:border-white/20">
      <div className={`mx-auto mb-2.5 h-1.5 w-12 rounded-full bg-gradient-to-r ${gradient}`} />
      <div className="font-bold text-white">{title}</div>
      <div className="mt-1 text-xs leading-relaxed text-slate-400">{subtitle}</div>
    </div>
  );
}

function Connector({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-1.5">
      <div className="h-5 w-px bg-gradient-to-b from-accent-cyan/60 to-accent-violet/60" />
      {label && (
        <span className="my-1 rounded-full border border-white/10 bg-ink-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400">
          {label}
        </span>
      )}
      <div className="h-5 w-px bg-gradient-to-b from-accent-cyan/60 to-accent-violet/60" />
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-accent-violet/70" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}

export default function ArchitecturePage() {
  return (
    <div className="container-page py-16">
      <p className="section-label mb-4">System design</p>
      <h1 className="mb-4 text-4xl font-extrabold text-white">How this site works</h1>
      <p className="mb-10 max-w-2xl text-lg text-slate-400">
        This portfolio is intentionally a working system, not a static page. Here is the request
        flow and the decisions behind each layer.
      </p>

      {/* Request-flow diagram */}
      <div className="card mb-12">
        <div className="mx-auto flex max-w-xl flex-col items-center">
          <Node title="Browser" subtitle="The visitor's device" gradient="from-slate-500 to-slate-600" />
          <Connector label="HTTPS" />
          <Node
            title="nginx"
            subtitle="Reverse proxy · TLS · security headers · www → apex"
            gradient="from-cyan-500 to-sky-600"
          />
          <Connector />
          <div className="grid w-full gap-4 sm:grid-cols-2">
            <Node
              title="Next.js — web"
              subtitle="SSR · React · renders from the API over HTTP/JSON"
              gradient="from-violet-500 to-fuchsia-600"
            />
            <Node
              title="Fastify — API"
              subtitle="Zod · OpenAPI · rate-limit · /health · /metrics"
              gradient="from-emerald-500 to-teal-600"
            />
          </div>
          <Connector label="SQL · Drizzle" />
          <Node
            title="PostgreSQL"
            subtitle="Projects · contact messages · analytics"
            gradient="from-indigo-500 to-blue-600"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {layers.map((layer) => (
          <section key={layer.title} className="card">
            <h2 className="mb-3 text-lg font-bold text-white">{layer.title}</h2>
            <ul className="space-y-2 text-sm text-slate-400">
              {layer.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-1 text-accent">▹</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-accent/30 bg-accent/5 p-6">
        <h2 className="mb-2 text-lg font-bold text-white">See it for yourself</h2>
        <p className="mb-4 text-sm text-slate-300">
          The API is self-documenting. Every endpoint below is live and interactive.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href={`${apiUrl}/docs`} target="_blank" rel="noreferrer" className="btn-primary">
            Interactive API docs ↗
          </a>
          <a href={`${apiUrl}/metrics`} target="_blank" rel="noreferrer" className="btn-ghost">
            Prometheus metrics ↗
          </a>
          <a href={`${apiUrl}/ready`} target="_blank" rel="noreferrer" className="btn-ghost">
            Readiness probe ↗
          </a>
        </div>
      </div>
    </div>
  );
}
