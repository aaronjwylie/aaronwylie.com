import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import parser from 'cron-parser';
import cronstrue from 'cronstrue';

export async function cronRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/cron',
    {
      config: { rateLimit: { max: 120, timeWindow: '1 minute' } },
      schema: {
        tags: ['tools'],
        summary: 'Explain a cron expression and list upcoming runs',
        querystring: z.object({
          expr: z.string().min(1).max(120),
          tz: z.string().max(64).default('UTC'),
        }),
      },
    },
    async (request) => {
      const { expr, tz } = request.query;
      try {
        const description = cronstrue.toString(expr, { throwExceptionOnParseError: true });
        const interval = parser.parseExpression(expr, { tz });
        const next: string[] = [];
        for (let i = 0; i < 5; i++) next.push(interval.next().toISOString());
        return { valid: true as const, description, next, tz };
      } catch (e) {
        return { valid: false as const, error: (e as Error).message || 'Invalid cron expression.' };
      }
    },
  );
}
