# Developer Portfolio — a backend that shows, not tells

A portfolio site that **is itself a working backend system**. The projects, contact form and live visitor stats you see on the site are all served by a documented REST API I built — so the site doubles as the flagship demo of what I can build.

> Live: `https://yourdomain.com` · API docs: `https://yourdomain.com/api/docs`

---

## Why it's built this way

Most portfolios are static pages that *describe* skills. For a backend engineer, that undersells the work. This one is a real full-stack system with a documented API, a relational data model, tests, containers and CI/CD — the site renders itself from live API data, and you can click into the [interactive API docs](/api/docs) to try every endpoint.

## Stack

| Layer | Tech | Notes |
|-------|------|-------|
| **Web** | Next.js 14 (App Router), TypeScript, Tailwind | Server Components render from the live API |
| **API** | Fastify, TypeScript, Zod | Zod schemas drive validation, serialization **and** OpenAPI docs |
| **Data** | Postgres, Drizzle ORM | SQL-first, migrations in version control |
| **Observability** | pino logs, Prometheus `/metrics`, `/health` + `/ready` | Real probes for load balancers & monitors |
| **Infra** | Docker, docker-compose, nginx, GitHub Actions | One artifact, deployable to any Docker host |

## Architecture

```
Browser ──HTTPS──▶ nginx ──▶ Next.js (web) ──HTTP──▶ Fastify (API) ──SQL──▶ Postgres
                     └──/api/*──────────────────────────▲
```

The API is the source of truth. The web app is a client of it — exactly like a real product. See the in-site [Architecture page](/architecture) for the full write-up.

## Quick start (local)

```bash
cp .env.example .env

# Option 1 — everything in Docker (Postgres + API + web), migrated & seeded:
docker compose up --build
# → web  http://localhost:3000
# → API  http://localhost:4000/docs

# Option 2 — local dev with hot reload (needs a Postgres; `npm run db:up` starts one):
npm install
npm run db:up
npm run db:migrate --workspace apps/api
npm run db:seed --workspace apps/api
npm run dev        # runs API (:4000) and web (:3000)
```

## Tests

```bash
npm test           # API integration tests against a real Postgres (Vitest)
```
CI (`.github/workflows/ci.yml`) runs typecheck, tests against a Postgres service, both app builds, and both Docker image builds on every push.

## Make it yours

- **Projects** are seeded from [`apps/api/src/db/seed.ts`](apps/api/src/db/seed.ts) — edit APPIX's links/press and add your own, then re-run the seed (it upserts by slug).
- **Name & metadata**: [`apps/web/app/layout.tsx`](apps/web/app/layout.tsx), [`apps/web/components/Nav.tsx`](apps/web/components/Nav.tsx).
- **Deploy**: see [`deploy/DEPLOY.md`](deploy/DEPLOY.md) — DigitalOcean Droplet or App Platform, step by step.

## Repository layout

```
apps/
  api/   Fastify + TypeScript API (Drizzle, Zod, OpenAPI, metrics, tests)
  web/   Next.js + Tailwind frontend (renders from the API)
deploy/  nginx config + deployment guide
.github/ CI pipeline
docker-compose.yml   full stack: db + api + web
```
