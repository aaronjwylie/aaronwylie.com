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

// --- RDAP (modern WHOIS) --------------------------------------------------
// Query the authoritative RDAP server for the TLD (found via IANA's bootstrap
// registry, cached) instead of the shared rdap.org redirector, which rate-limits
// by IP. Falls back to rdap.org for TLDs missing from the registry.

interface Registration {
  registrar: string | null;
  created: string | null;
  updated: string | null;
  expires: string | null;
  status: string[];
  dnssec: boolean | null;
}

let bootstrap: { services: [string[], string[]][] } | null = null;
let bootstrapAt = 0;

async function rdapBaseFor(tld: string): Promise<string | null> {
  if (!bootstrap || Date.now() - bootstrapAt > 86_400_000) {
    try {
      const r = await fetch('https://data.iana.org/rdap/dns.json', {
        signal: AbortSignal.timeout(8000),
      });
      if (r.ok) {
        bootstrap = (await r.json()) as { services: [string[], string[]][] };
        bootstrapAt = Date.now();
      }
    } catch {
      /* keep any previously cached copy */
    }
  }
  if (!bootstrap) return null;
  for (const [tlds, urls] of bootstrap.services) {
    if (tlds.includes(tld) && urls[0]) return urls[0].replace(/\/$/, '') + '/';
  }
  return null;
}

async function lookupRdap(domain: string): Promise<Registration | null> {
  const tld = domain.split('.').pop() ?? '';
  const base = await rdapBaseFor(tld);
  const url = base ? `${base}domain/${domain}` : `https://rdap.org/domain/${domain}`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { accept: 'application/rdap+json' },
    });
    if (!res.ok) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    const events: any[] = data.events ?? [];
    const dateOf = (action: string) =>
      events.find((e) => e.eventAction === action)?.eventDate ?? null;

    let registrar: string | null = null;
    const regEntity = (data.entities ?? []).find((e: any) => (e.roles ?? []).includes('registrar'));
    if (regEntity) {
      const vcard: any[] = regEntity.vcardArray?.[1] ?? [];
      registrar = vcard.find((f) => f[0] === 'fn')?.[3] ?? regEntity.handle ?? null;
    }

    return {
      registrar,
      created: dateOf('registration'),
      updated: dateOf('last changed'),
      expires: dateOf('expiration'),
      status: Array.isArray(data.status) ? data.status : [],
      dnssec:
        typeof data.secureDNS?.delegationSigned === 'boolean'
          ? data.secureDNS.delegationSigned
          : null,
    };
  } catch {
    return null;
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
                updated: z.string().nullable(),
                expires: z.string().nullable(),
                status: z.array(z.string()),
                dnssec: z.boolean().nullable(),
              })
              .nullable(),
          }),
          400: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const domain = request.body.domain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .replace(/:\d+$/, '');
      if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
        return reply.code(400).send({ error: 'Enter a valid domain, e.g. example.com' });
      }

      const [A, AAAA, MX, TXT, NS, CNAME, registration] = await Promise.all([
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
        lookupRdap(domain),
      ]);

      return { domain, records: { A, AAAA, MX, TXT, NS, CNAME }, registration };
    },
  );
}
