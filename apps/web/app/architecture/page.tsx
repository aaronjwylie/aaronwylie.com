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
      <div className="card mb-12 overflow-x-auto">
        <pre className="font-mono text-xs leading-relaxed text-slate-300 sm:text-sm">{`
  Browser
     │  HTTPS
     ▼
  ┌─────────────┐     reverse proxy (TLS, routing)
  │    nginx    │
  └─────┬───────┘
        ├──────────────► ┌──────────────────┐   Server Components
        │   /            │  Next.js (web)   │   fetch live data
        │                └────────┬─────────┘
        │   /api/*                │  HTTP (JSON)
        ▼                         ▼
  ┌────────────────────────────────────────┐
  │        Fastify API (TypeScript)         │
  │  Zod validation · OpenAPI · rate-limit  │
  │  /health · /ready · /metrics (Prom)     │
  └───────────────────┬────────────────────┘
                      │  SQL (Drizzle)
                      ▼
              ┌───────────────┐
              │   Postgres    │
              └───────────────┘
`}</pre>
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
