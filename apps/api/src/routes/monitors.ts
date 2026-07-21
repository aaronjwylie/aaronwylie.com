import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { addMonitor, getStatus } from '../services/monitorService.js';
import { InspectError } from '../lib/inspect.js';

const StatusItem = z.object({
  id: z.number(),
  host: z.string(),
  url: z.string(),
  permanent: z.boolean(),
  expiresAt: z.string().nullable(),
  up: z.boolean().nullable(),
  uptime: z.number().nullable(),
  avgMs: z.number().nullable(),
  lastCheckedAt: z.string().nullable(),
  history: z.array(z.object({ ok: z.boolean(), ms: z.number().nullable() })),
});

export async function monitorRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/status',
    {
      schema: {
        tags: ['tools'],
        summary: 'Uptime status of all monitored endpoints',
        response: { 200: z.object({ monitors: z.array(StatusItem) }) },
      },
    },
    async () => ({ monitors: await getStatus() }),
  );

  app.post(
    '/monitors',
    {
      config: { rateLimit: { max: 10, timeWindow: '5 minutes' } },
      schema: {
        tags: ['tools'],
        summary: 'Add a URL to the uptime monitor (ephemeral, 24h)',
        body: z.object({ url: z.string().min(1).max(2048) }),
        response: {
          201: z.object({ ok: z.literal(true), id: z.number() }),
          400: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      let url = request.body.url.trim();
      if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
      try {
        const { id } = await addMonitor(url);
        return reply.code(201).send({ ok: true as const, id });
      } catch (e) {
        if (e instanceof InspectError) return reply.code(400).send({ error: e.message });
        request.log.error(e, 'add monitor failed');
        return reply.code(400).send({ error: 'Could not add that URL.' });
      }
    },
  );
}
