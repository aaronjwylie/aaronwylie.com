import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { assertSafeUrl, InspectError } from '../lib/inspect.js';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;
const MAX_BODY_OUT = 100_000;
const TIMEOUT_MS = 10_000;

export async function httpClientRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/http/send',
    {
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
      schema: {
        tags: ['tools'],
        summary: 'Send an HTTP request (SSRF-safe)',
        description:
          'Executes an arbitrary HTTP request server-side and returns the response (status, ' +
          'headers, timing, body). Private/reserved hosts are refused and redirects are not ' +
          'followed automatically.',
        body: z.object({
          method: z.enum(METHODS).default('GET'),
          url: z.string().min(1).max(2048),
          headers: z
            .array(z.object({ key: z.string().max(256), value: z.string().max(8192) }))
            .max(40)
            .default([]),
          body: z.string().max(1_000_000).optional(),
        }),
      },
    },
    async (request, reply) => {
      let url: URL;
      try {
        url = await assertSafeUrl(request.body.url);
      } catch (e) {
        return reply.code(400).send({ error: e instanceof InspectError ? e.message : 'Invalid URL.' });
      }

      const { method } = request.body;
      const headers: Record<string, string> = {};
      for (const h of request.body.headers) if (h.key.trim()) headers[h.key.trim()] = h.value;
      const hasBody = method !== 'GET' && method !== 'HEAD';

      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      const started = Date.now();
      try {
        const res = await fetch(url.toString(), {
          method,
          headers,
          body: hasBody ? request.body.body : undefined,
          redirect: 'manual',
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        const timeMs = Date.now() - started;
        const respHeaders: Record<string, string> = {};
        res.headers.forEach((v, k) => {
          respHeaders[k] = v;
        });
        const raw = await res.text();
        const truncated = raw.length > MAX_BODY_OUT;
        return {
          status: res.status,
          statusText: res.statusText,
          timeMs,
          size: raw.length,
          truncated,
          headers: respHeaders,
          body: truncated ? raw.slice(0, MAX_BODY_OUT) : raw,
        };
      } catch (e) {
        clearTimeout(timer);
        const msg =
          (e as Error).name === 'AbortError'
            ? `Request timed out after ${TIMEOUT_MS / 1000}s.`
            : `Request failed: ${(e as Error).message}`;
        return reply.code(502).send({ error: msg });
      }
    },
  );
}
