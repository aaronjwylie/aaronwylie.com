## The idea

Most portfolios *describe* what someone can build. I wanted mine to let you *use* it. So I built a suite of genuinely useful developer tools directly into this site - each one served by my own API, and each deliberately chosen to exercise a different backend skill. The result is a set of tools people can actually reach for, which happens to double as a live demonstration of range.

## The tools

There are ten, and no two lean on the same part of the stack:

- **Instant Mock API** - design a resource and get a live REST endpoint serving realistic, **deterministic** fake data (pagination, filtering, sorting, search, simulated writes). The server stores only the schema; every response is generated on demand from a per-resource seed.
- **Live Collaboration Room** - a real-time, many-to-many room: presence, live cursors, a shared notepad and reactions, fanned out to everyone over **WebSockets** with ephemeral in-memory state.
- **Endpoint Inspector** - checks any URL's HTTP status, response time, redirect chain, TLS certificate and security-header grade. It makes outbound requests on user input, so it's carefully **SSRF-safe**.
- **Password Breach Checker** - tells you if a password appears in a known breach using **k-anonymity**: the password is hashed in your browser and only a 5-character prefix is sent.
- **Live Status Monitor** - a real uptime monitor with a **background worker** that checks endpoints every 60 seconds and stores time-series data, computing uptime and response-time history.
- **Webhook / Request Inspector** - gives you a unique URL and streams incoming HTTP requests to your browser in real time over a **WebSocket**.
- **URL Shortener** - short links with **click analytics computed in SQL**, and a safe destination-preview before redirecting.
- **One-Time Secret** - share a secret via a link that self-destructs after one view, **encrypted in the browser** with the key kept out of the server's reach.
- **DNS & WHOIS Lookup** - resolves DNS records and registration data via **RDAP**, querying authoritative servers directly.
- **QR Code Generator** - server-side SVG generation with SVG/PNG export.

## The engineering

Everything runs on one TypeScript API built with **Fastify** and **PostgreSQL**. A few patterns show up across the suite:

- **Zod schemas as a single source of truth** - they validate input, serialize output, and generate the interactive OpenAPI docs, so the docs can never drift from the code.
- **Security by default** - SSRF protection on any outbound-request tool, rate limiting on every endpoint, client-side crypto where the server shouldn't see plaintext.
- **Bounded, ephemeral state** - webhook bins and visitor-added monitors auto-expire and are capped, so nothing grows unbounded.
- **Real-time and background work** - WebSockets for live streaming to the browser, and an in-process worker loop for scheduled checks.

The whole thing is containerized with Docker, fronted by nginx with TLS and a strict security-header policy, and deployed with CI/CD.

## What it demonstrates

Breadth, applied. In one codebase you can see real-time systems, cryptography, background jobs, SQL analytics, security engineering, and clean API design - not as buzzwords, but as tools you can click and watch work.

*Try them at [/tools](/tools).*
