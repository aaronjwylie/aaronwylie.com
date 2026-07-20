import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { sql } from '../db/client.js';

/**
 * Liveness and readiness endpoints.
 *   - /health  : cheap liveness — is the process up?
 *   - /ready   : readiness — can we actually reach the database?
 * Kubernetes/DO health checks and uptime monitors hit these.
 */
export async function healthRoutes(app: FastifyInstance) {
  app.get(
    '/health',
    {
      schema: {
        tags: ['observability'],
        summary: 'Liveness probe',
        response: {
          200: z.object({
            status: z.literal('ok'),
            uptime: z.number(),
            timestamp: z.string(),
          }),
        },
      },
    },
    async () => ({
      status: 'ok' as const,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
  );

  app.get(
    '/ready',
    {
      schema: {
        tags: ['observability'],
        summary: 'Readiness probe',
        description: 'Returns 200 only if the database is reachable.',
        response: {
          200: z.object({ status: z.literal('ready'), db: z.literal('up') }),
          503: z.object({ status: z.literal('unavailable'), db: z.literal('down') }),
        },
      },
    },
    async (_req, reply) => {
      try {
        await sql`select 1`;
        return { status: 'ready' as const, db: 'up' as const };
      } catch {
        return reply.code(503).send({ status: 'unavailable' as const, db: 'down' as const });
      }
    },
  );
}
