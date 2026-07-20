# Deploying to DigitalOcean (or any Docker host)

The whole stack is Docker-based, so deployment is the same anywhere: **clone → set env → `docker compose up`**. This guide uses a DigitalOcean Droplet, but Hetzner, AWS Lightsail, Fly.io or bare metal work identically.

---

## Option A — Droplet + Docker Compose (recommended, full infra control)

This runs the web app, API and Postgres on one small Droplet behind nginx with free TLS. Great "I manage my own infra" signal.

### 1. Create the Droplet
- DigitalOcean → **Create → Droplet**
- Image: **Ubuntu 24.04 LTS**
- Plan: **Basic → Regular → $6/mo** (1 GB / 1 vCPU is plenty)
- Add your SSH key, create.

### 2. Point your domain
In your DNS provider (or DigitalOcean → Networking → Domains) add an **A record** for `yourdomain.com` → the Droplet's IP. Add another for `www`.

### 3. Install Docker on the Droplet
```bash
ssh root@YOUR_DROPLET_IP
curl -fsSL https://get.docker.com | sh
```

### 4. Get the code and configure env
```bash
git clone https://github.com/YOURNAME/portfolio.git
cd portfolio
cp .env.example .env
nano .env
```
Set real values:
```env
POSTGRES_PASSWORD=<a long random string>
ADMIN_TOKEN=<a long random string>
CORS_ORIGIN=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```
> `NEXT_PUBLIC_API_URL` is baked into the browser bundle at build time and must be the **public** URL. Server-side rendering uses the internal `http://api:4000` automatically (see `docker-compose.yml`).

### 5. Launch the stack
```bash
docker compose up -d --build
```
This starts Postgres, runs migrations + seed, starts the API, and starts the web app. Check it:
```bash
docker compose ps
curl localhost:4000/health
curl localhost:3000 | grep APPIX
```

### 6. nginx + TLS
```bash
apt install -y nginx certbot python3-certbot-nginx
cp deploy/nginx.conf /etc/nginx/sites-available/portfolio
# edit server_name in that file to your domain
ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/portfolio
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
certbot rewrites the config for HTTPS and sets up auto-renewal. Done — visit `https://yourdomain.com`.

### 7. Updating later
```bash
git pull && docker compose up -d --build
```

---

## Option B — DigitalOcean App Platform (managed, less babysitting)

1. Push this repo to GitHub.
2. DigitalOcean → **Apps → Create App → from GitHub**, pick the repo.
3. App Platform detects two Dockerfiles. Create two components:
   - **api** — Dockerfile `apps/api/Dockerfile`, HTTP port `4000`, route `/api`.
   - **web** — Dockerfile `apps/web/Dockerfile`, HTTP port `3000`, route `/`.
4. Add a **Dev/managed Postgres database** and bind `DATABASE_URL` to the api component.
5. Set env vars (`ADMIN_TOKEN`, `CORS_ORIGIN`, `NEXT_PUBLIC_API_URL`) per the `.env.example`.
6. Add a **pre-deploy job** (or the api start command) that runs `node dist/db/migrate.js && node dist/db/seed.js`.

App Platform gives you TLS, a subdomain, and auto-deploy on push out of the box.

---

## Customising the content

- **Your projects** live in the database, seeded from `apps/api/src/db/seed.ts`. Edit that file (especially the APPIX links and press URLs), then re-run the seed — it upserts by slug, so edits are safe to re-apply:
  ```bash
  docker compose exec api node dist/db/seed.js
  ```
- **Your name / metadata**: `apps/web/app/layout.tsx` and `components/Nav.tsx`.
- **Read contact submissions**:
  ```bash
  curl -H "x-admin-token: $ADMIN_TOKEN" https://yourdomain.com/api/contact
  ```

## Health & observability
- `GET /api/health` — liveness (for uptime monitors / load balancers)
- `GET /api/ready` — readiness (checks the DB)
- `GET /api/metrics` — Prometheus metrics (point Grafana Cloud / Prometheus here)
- `GET /api/docs` — interactive OpenAPI docs
