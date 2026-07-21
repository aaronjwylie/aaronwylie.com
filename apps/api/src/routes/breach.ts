import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

/**
 * Password breach check via HaveIBeenPwned's Pwned Passwords range API, using
 * k-anonymity: the client computes SHA-1(password) in the browser and sends ONLY
 * the first 5 hex characters. This server relays that prefix to HIBP and returns
 * the matching suffixes + counts; the client does the final match locally. The
 * full password and full hash never reach this server.
 */
export async function breachRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/breach-check',
    {
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
      schema: {
        tags: ['tools'],
        summary: 'Check a password-hash prefix against known breaches',
        description:
          'k-anonymity proxy to HaveIBeenPwned. Send the first 5 hex chars of the SHA-1 of a ' +
          'password; get back the matching hash suffixes and how many breaches each appears in. ' +
          'The password itself never leaves the browser.',
        body: z.object({
          prefix: z
            .string()
            .length(5)
            .regex(/^[0-9A-Fa-f]{5}$/, 'prefix must be 5 hex characters'),
        }),
        response: {
          200: z.object({
            ranges: z.array(z.object({ suffix: z.string(), count: z.number() })),
          }),
          400: z.object({ error: z.string() }),
          502: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const prefix = request.body.prefix.toUpperCase();
      try {
        const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
          headers: {
            // Padded responses defeat traffic analysis of the prefix.
            'Add-Padding': 'true',
            'User-Agent': 'aaronwylie.com-password-checker',
          },
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return reply.code(502).send({ error: 'Breach service is unavailable.' });
        const text = await res.text();
        const ranges = text
          .split('\n')
          .map((line) => {
            const [suffix, countStr] = line.trim().split(':');
            return { suffix: suffix ?? '', count: Number(countStr ?? 0) };
          })
          // Drop padding rows (count 0) and anything malformed.
          .filter((r) => r.suffix.length === 35 && Number.isFinite(r.count) && r.count > 0);
        return { ranges };
      } catch {
        return reply.code(502).send({ error: 'Could not reach the breach service.' });
      }
    },
  );
}
