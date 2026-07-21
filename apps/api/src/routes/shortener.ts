import { randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { eq, sql as dsql } from 'drizzle-orm';
import { db, sql } from '../db/client.js';
import { shortLinks, linkClicks } from '../db/schema.js';

const SITE_URL = 'https://aaronwylie.com';
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function genCode(len = 6): string {
  const b = randomBytes(len);
  let s = '';
  for (let i = 0; i < len; i++) s += ALPHABET[b[i]! % ALPHABET.length];
  return s;
}

export async function shortenerRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/shorten',
    {
      config: { rateLimit: { max: 15, timeWindow: '10 minutes' } },
      schema: {
        tags: ['tools'],
        summary: 'Create a short link',
        body: z.object({ url: z.string().min(1).max(2048) }),
        response: {
          201: z.object({ code: z.string(), shortUrl: z.string(), url: z.string() }),
          400: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      let raw = request.body.url.trim();
      if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
      let parsed: URL;
      try {
        parsed = new URL(raw);
      } catch {
        return reply.code(400).send({ error: 'That does not look like a valid URL.' });
      }
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return reply.code(400).send({ error: 'Only http and https URLs can be shortened.' });
      }
      // Avoid self-referential loops through our own short paths.
      if (parsed.hostname === 'aaronwylie.com' && parsed.pathname.startsWith('/s/')) {
        return reply.code(400).send({ error: 'Refusing to shorten another short link.' });
      }

      // Create with a unique code (retry on the rare collision).
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = genCode();
        try {
          await db.insert(shortLinks).values({ code, url: parsed.toString() });
          return reply.code(201).send({ code, shortUrl: `${SITE_URL}/s/${code}`, url: parsed.toString() });
        } catch {
          /* code collision — try again */
        }
      }
      return reply.code(400).send({ error: 'Could not generate a link, please retry.' });
    },
  );

  // Resolve a code AND record a click. Used by the redirect preview page.
  app.post(
    '/links/:code/hit',
    {
      schema: {
        tags: ['tools'],
        summary: 'Resolve a short link and record a click',
        params: z.object({ code: z.string() }),
        body: z.object({ referrer: z.string().max(512).optional() }).optional(),
        response: {
          200: z.object({ url: z.string() }),
          404: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const [link] = await db
        .select({ id: shortLinks.id, url: shortLinks.url })
        .from(shortLinks)
        .where(eq(shortLinks.code, request.params.code))
        .limit(1);
      if (!link) return reply.code(404).send({ error: 'Short link not found.' });
      const day = new Date().toISOString().slice(0, 10);
      const referrer = request.body?.referrer?.slice(0, 512) ?? null;
      await db.insert(linkClicks).values({ linkId: link.id, day, referrer });
      return { url: link.url };
    },
  );

  // Public analytics for a code (does not count as a click).
  app.get(
    '/links/:code',
    {
      schema: {
        tags: ['tools'],
        summary: 'Analytics for a short link',
        params: z.object({ code: z.string() }),
        response: {
          200: z.object({
            code: z.string(),
            url: z.string(),
            createdAt: z.string(),
            clicks: z.number(),
            clicksByDay: z.array(z.object({ day: z.string(), count: z.number() })),
            topReferrers: z.array(z.object({ referrer: z.string(), count: z.number() })),
          }),
          404: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const [link] = await db
        .select()
        .from(shortLinks)
        .where(eq(shortLinks.code, request.params.code))
        .limit(1);
      if (!link) return reply.code(404).send({ error: 'Short link not found.' });

      const clicksRows = await db
        .select({ clicks: dsql<number>`count(*)::int` })
        .from(linkClicks)
        .where(eq(linkClicks.linkId, link.id));
      const clicks = clicksRows[0]?.clicks ?? 0;

      const clicksByDay = await sql<{ day: string; count: number }[]>`
        select day, count(*)::int as count from link_clicks
        where link_id = ${link.id} and at > now() - interval '7 days'
        group by day order by day asc`;

      const topReferrers = await sql<{ referrer: string; count: number }[]>`
        select coalesce(nullif(referrer, ''), 'direct') as referrer, count(*)::int as count
        from link_clicks where link_id = ${link.id}
        group by 1 order by 2 desc limit 5`;

      return {
        code: link.code,
        url: link.url,
        createdAt: link.createdAt.toISOString(),
        clicks,
        clicksByDay,
        topReferrers,
      };
    },
  );
}
