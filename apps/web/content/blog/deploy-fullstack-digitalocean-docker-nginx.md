When I put a new full-stack app online, I want three things: reproducible builds, one command to deploy, and real HTTPS. A single DigitalOcean Droplet running Docker behind nginx gives me all three for about $6 a month. Here's the exact shape of a setup I use in production.

## The pieces

- **A Droplet** — a plain Ubuntu VM. Nothing special; 1 GB of RAM is enough for a small Node app plus Postgres if you add swap.
- **Docker Compose** — the web app, the API, and the database as three services on one private network.
- **nginx** — a reverse proxy terminating TLS and routing `/` to the web app and `/api` to the API.
- **Let's Encrypt** — free, auto-renewing certificates.

## Bind everything to localhost

The single most important thing people miss: **Docker publishes ports by writing iptables rules that bypass `ufw`.** If you `EXPOSE` Postgres on `5432`, it can be reachable from the internet even with a firewall "enabled." The fix is to bind published ports to the loopback interface so only nginx (running on the host) can reach them:

    services:
      db:
        ports:
          - "127.0.0.1:5432:5432"
      api:
        ports:
          - "127.0.0.1:4000:4000"

Now `ufw` can allow only 22, 80, and 443, and your app/database ports are genuinely private.

## nginx as the front door

nginx owns 80/443 and forwards to the containers on loopback:

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
    location /api/ {
        proxy_pass http://127.0.0.1:4000/;
    }

The trailing slash on `proxy_pass` for `/api/` strips the prefix, so the API sees `/health` rather than `/api/health`.

## HTTPS in one command

With DNS pointed at the Droplet and nginx serving on port 80, certbot does the rest:

    certbot --nginx -d example.com -d www.example.com --redirect

It provisions the certificate, rewrites your nginx config to add the 443 server block, sets up the HTTP→HTTPS redirect, and schedules renewals. You're done.

## Wait for the database

Containers start in parallel, so the API often boots before Postgres is accepting connections — and DNS for the `db` service name can even lag by a second. Rather than crash-looping, retry with backoff before running migrations:

    for (let i = 1; i <= 30; i++) {
      try { await sql`select 1`; break; }
      catch { await new Promise(r => setTimeout(r, 1000)); }
    }

This one loop turns a flaky first boot into a reliable one.

## The whole deploy

Once it's wired up, shipping a change is just:

    git pull && docker compose up -d --build

The images rebuild, migrations run, the containers swap in, and nginx keeps serving. No snowflake servers, no manual steps to forget.

## Why not a managed platform?

Managed platforms are great and I use them too. But a Droplet you configure yourself is cheaper, has no cold starts, and — importantly for a portfolio — *demonstrates* that you understand the whole path from a container to a public HTTPS URL. That understanding pays off the first time something breaks in production.

*Building something that needs to go live? [Get in touch](/#contact) — this is the kind of end-to-end work I do every week.*
