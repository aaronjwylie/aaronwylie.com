import dns from 'node:dns/promises';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

async function safe<T>(fn: () => Promise<T[]>): Promise<T[]> {
  try {
    return await fn();
  } catch {
    return [];
  }
}

export async function dnsRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/dns',
    {
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
      schema: {
        tags: ['tools'],
        summary: 'DNS records + registration (RDAP) for a domain',
        body: z.object({ domain: z.string().min(1).max(255) }),
        response: {
          200: z.object({
            domain: z.string(),
            records: z.object({
              A: z.array(z.string()),
              AAAA: z.array(z.string()),
              MX: z.array(z.string()),
              TXT: z.array(z.string()),
              NS: z.array(z.string()),
              CNAME: z.array(z.string()),
            }),
            registration: z
              .object({
                registrar: z.string().nullable(),
                created: z.string().nullable(),
                expires: z.string().nullable(),
                status: z.array(z.string()),
              })
              .nullable(),
          }),
          400: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      let domain = request.body.domain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .replace(/:\d+$/, '');
      if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
        return reply.code(400).send({ error: 'Enter a valid domain, e.g. example.com' });
      }

      const [A, AAAA, MX, TXT, NS, CNAME] = await Promise.all([
        safe(() => dns.resolve4(domain)),
        safe(() => dns.resolve6(domain)),
        safe(() =>
          dns
            .resolveMx(domain)
            .then((r) => r.sort((a, b) => a.priority - b.priority).map((m) => `${m.priority} ${m.exchange}`)),
        ),
        safe(() => dns.resolveTxt(domain).then((r) => r.map((t) => t.join('')))),
        safe(() => dns.resolveNs(domain)),
        safe(() => dns.resolveCname(domain)),
      ]);

      // Registration data via RDAP (the modern WHOIS; public, no key needed).
      let registration: {
        registrar: string | null;
        created: string | null;
        expires: string | null;
        status: string[];
      } | null = null;
      try {
        const res = await fetch(`https://rdap.org/domain/${domain}`, {
          signal: AbortSignal.timeout(8000),
          headers: { accept: 'application/rdap+json' },
        });
        if (res.ok) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: any = await res.json();
          const events: any[] = data.events ?? [];
          const created = events.find((e) => e.eventAction === 'registration')?.eventDate ?? null;
          const expires = events.find((e) => e.eventAction === 'expiration')?.eventDate ?? null;
          let registrar: string | null = null;
          const regEntity = (data.entities ?? []).find((e: any) => (e.roles ?? []).includes('registrar'));
          if (regEntity) {
            const vcard: any[] = regEntity.vcardArray?.[1] ?? [];
            const fn = vcard.find((f) => f[0] === 'fn');
            registrar = fn?.[3] ?? regEntity.handle ?? null;
          }
          registration = { registrar, created, expires, status: data.status ?? [] };
        }
      } catch {
        /* RDAP is best-effort */
      }

      return { domain, records: { A, AAAA, MX, TXT, NS, CNAME }, registration };
    },
  );
}
