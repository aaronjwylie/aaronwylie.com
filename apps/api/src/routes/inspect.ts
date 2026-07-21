import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { inspectUrl, InspectError } from '../lib/inspect.js';

const ResultSchema = z.object({
  requestedUrl: z.string(),
  finalUrl: z.string(),
  status: z.number(),
  statusText: z.string(),
  ok: z.boolean(),
  timingMs: z.number(),
  redirects: z.array(z.object({ url: z.string(), status: z.number() })),
  server: z.string().nullable(),
  headers: z.record(z.string()),
  tls: z
    .object({
      issuer: z.string(),
      subject: z.string(),
      validFrom: z.string(),
      validTo: z.string(),
      daysRemaining: z.number(),
      authorized: z.boolean(),
      authorizationError: z.string().nullable(),
    })
    .nullable(),
  security: z.object({
    grade: z.string(),
    score: z.number(),
    checks: z.array(z.object({ label: z.string(), present: z.boolean() })),
  }),
});

export async function inspectRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/inspect',
    {
      // Outbound-request endpoint — keep it modestly rate limited.
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
      schema: {
        tags: ['tools'],
        summary: 'Inspect a URL',
        description:
          'Fetches a URL and reports HTTP status, response time, the redirect chain, the ' +
          'TLS certificate (issuer + expiry), a security-header grade, and the response ' +
          'headers. Private/reserved addresses are refused (SSRF-safe).',
        body: z.object({
          url: z
            .string()
            .min(1)
            .max(2048)
            .describe('The URL to inspect, e.g. https://example.com'),
        }),
        response: {
          200: ResultSchema,
          400: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      // Accept bare hostnames ("example.com") by defaulting to https.
      let url = request.body.url.trim();
      if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
      try {
        return await inspectUrl(url);
      } catch (e) {
        if (e instanceof InspectError) return reply.code(400).send({ error: e.message });
        request.log.error(e, 'inspect failed');
        return reply.code(400).send({ error: 'Could not inspect that URL.' });
      }
    },
  );
}
