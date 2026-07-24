import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { sql as dsql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { pageViews } from '../db/schema.js';
import { env } from '../env.js';
import { clientIp, geolocate } from '../lib/geo.js';
import { runDigest } from '../services/digestService.js';

// Starting baselines for the homepage counters.
const BASELINE_VIEWS = 1000;
const BASELINE_DAYS = 300;

export async function statsRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.post(
    '/stats/view',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: {
        tags: ['stats'],
        summary: 'Record a page view',
        body: z.object({ path: z.string().min(1).max(512) }),
        response: { 202: z.object({ ok: z.literal(true) }) },
      },
    },
    async (request, reply) => {
      const day = new Date().toISOString().slice(0, 10);
      const path = request.body.path.slice(0, 512);
      const ip = clientIp(request.headers, request.ip);
      // Fire-and-forget so the beacon never waits on the geo lookup. We store
      // only the coarse city/country - never the IP itself.
      void (async () => {
        const geo = await geolocate(ip);
        await db.insert(pageViews).values({
          path,
          day,
          country: geo?.country ?? null,
          countryCode: geo?.countryCode ?? null,
          city: geo?.city ?? null,
        });
      })().catch((err) => request.log.error(err, 'page view insert failed'));
      return reply.code(202).send({ ok: true as const });
    },
  );

  // Trigger the usage digest immediately (admin-only). Defaults to today so
  // there's fresh data to preview; the scheduled job summarises yesterday.
  app.post(
    '/stats/digest/run',
    {
      schema: {
        tags: ['stats'],
        summary: 'Send the usage digest now (admin)',
        description: 'Requires the `x-admin-token` header. Optional `?day=YYYY-MM-DD`.',
        headers: z.object({ 'x-admin-token': z.string().optional() }),
        querystring: z.object({ day: z.string().optional() }),
      },
    },
    async (request, reply) => {
      if (request.headers['x-admin-token'] !== env.ADMIN_TOKEN) {
        return reply.code(401).send({ error: 'unauthorized' });
      }
      const day = request.query.day ?? new Date().toISOString().slice(0, 10);
      const result = await runDigest(request.log, day, { force: true });
      return reply.send({ sent: result.sent, summary: result.summary });
    },
  );

  app.get(
    '/stats',
    {
      schema: {
        tags: ['stats'],
        summary: 'Aggregate visitor stats',
        description: 'Live totals computed in SQL - proof the site is backed by a real database.',
        response: {
          200: z.object({
            totalViews: z.number(),
            activeDays: z.number(),
            topPaths: z.array(z.object({ path: z.string(), views: z.number() })),
          }),
        },
      },
    },
    async () => {
      const [totals] = await db
        .select({
          totalViews: dsql<number>`count(*)::int`,
          activeDays: dsql<number>`count(distinct ${pageViews.day})::int`,
        })
        .from(pageViews);

      const topPaths = await db
        .select({
          path: pageViews.path,
          views: dsql<number>`count(*)::int`,
        })
        .from(pageViews)
        .groupBy(pageViews.path)
        .orderBy(dsql`count(*) desc`)
        .limit(5);

      return {
        // Baseline the vanity counters so they start at a round number and grow
        // from there with real traffic.
        totalViews: (totals?.totalViews ?? 0) + BASELINE_VIEWS,
        activeDays: (totals?.activeDays ?? 0) + BASELINE_DAYS,
        topPaths,
      };
    },
  );
}
