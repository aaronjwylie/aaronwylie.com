import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { compactVerify, importSPKI } from 'jose';

function decodeSegment(seg: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(seg, 'base64url').toString('utf8'));
}

export async function jwtRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/jwt/verify',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: {
        tags: ['tools'],
        summary: 'Verify a JWT signature',
        description:
          'Verifies the signature of a JWT. For HS* algorithms provide the shared secret; for ' +
          'RS*/ES*/PS* provide a PEM public key. Only the signature is checked - expiry is reported ' +
          'from the decoded claims, so an expired-but-authentic token still shows as a valid signature.',
        body: z.object({
          token: z.string().min(1).max(8192),
          secret: z.string().max(4096).optional(),
          publicKey: z.string().max(8192).optional(),
        }),
      },
    },
    async (request, reply) => {
      const parts = request.body.token.trim().split('.');
      if (parts.length !== 3) {
        return reply.code(400).send({ error: 'Not a valid JWT (expected three dot-separated parts).' });
      }

      let header: Record<string, unknown>;
      try {
        header = decodeSegment(parts[0]!);
      } catch {
        return reply.code(400).send({ error: 'Could not decode the token header.' });
      }
      const alg = String(header.alg ?? '');

      let verified = false;
      let reason: string | null = null;
      try {
        if (alg.startsWith('HS')) {
          if (!request.body.secret) {
            reason = 'Provide the shared secret to verify an HS* token.';
          } else {
            await compactVerify(request.body.token, new TextEncoder().encode(request.body.secret));
            verified = true;
          }
        } else if (/^(RS|ES|PS)/.test(alg)) {
          if (!request.body.publicKey) {
            reason = 'Provide a PEM public key to verify an ' + alg + ' token.';
          } else {
            const key = await importSPKI(request.body.publicKey.trim(), alg);
            await compactVerify(request.body.token, key);
            verified = true;
          }
        } else if (alg === 'none') {
          reason = 'Algorithm "none" - this token is unsigned.';
        } else {
          reason = `Unsupported algorithm: ${alg || 'unknown'}.`;
        }
      } catch {
        reason = 'Signature verification failed.';
      }

      return { alg, verified, reason };
    },
  );
}
