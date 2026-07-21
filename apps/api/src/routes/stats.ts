import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { sql as dsql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { pageViews } from '../db/schema.js';

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
      await db.insert(pageViews).values({ path: request.body.path.slice(0, 512), day });
      return reply.code(202).send({ ok: true as const });
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
        totalViews: totals?.totalViews ?? 0,
        activeDays: totals?.activeDays ?? 0,
        topPaths,
      };
    },
  );
}
