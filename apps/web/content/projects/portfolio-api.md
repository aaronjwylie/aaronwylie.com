## The idea

A portfolio for a backend-leaning developer has a chicken-and-egg problem: the best way to prove you can build reliable systems is to *point at one* - but a static site proves nothing. So I made the site itself the proof. Everything you see here - the projects, the tools, the live visitor stats, the contact form - is served by a REST API I built, deployed on infrastructure I configured. The portfolio is its own demo.

## The stack

- **Fastify + TypeScript** for the API, with **Drizzle** and **PostgreSQL** for data.
- **Zod schemas as a single source of truth** - one schema validates each request, serializes the response, and generates the interactive OpenAPI docs, so the docs can never drift from the code.
- **Next.js** for the front end, rendering from the live API.

## What a "real" API needs

Beyond the happy path, the API ships the things production systems actually require:

- **Structured, request-scoped logging** so every log line is traceable.
- **Prometheus metrics** and **liveness/readiness probes** for health and monitoring.
- **Per-route rate limiting** and **SSRF protection** on outbound-request tools.
- **A full test suite (Vitest)** that runs against a real Postgres in CI.
- A **background worker** driving the uptime monitor and **WebSockets** powering the live webhook inspector.

## Deployment

The whole system is containerized with **Docker Compose** (web, API and database on one private network), fronted by **nginx** terminating TLS and routing `/` to the web app and `/api` to the API. App and database ports are bound to loopback so only nginx can reach them. HTTPS comes from Let's Encrypt, and a strict security-header policy earns the site an A on its own Endpoint Inspector tool. Shipping a change is a single command that rebuilds the images, runs migrations and swaps the containers in.

## What it demonstrates

End-to-end ownership: schema design, a clean and documented API, security and observability baked in, a real test suite, and the full path from a container to a public HTTPS URL. You don't have to take my word for the backend - you can [browse the live docs](/api/docs) and see every endpoint.

*I wrote about a couple of the patterns behind it: [One Zod Schema, Three Jobs](/blog/zod-single-source-of-truth-fastify-openapi) and [Deploying a Full-Stack App to DigitalOcean](/blog/deploy-fullstack-digitalocean-docker-nginx).*
