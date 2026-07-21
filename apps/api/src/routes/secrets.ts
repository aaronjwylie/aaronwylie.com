import { randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { eq, lt } from 'drizzle-orm';
import { db } from '../db/client.js';
import { secrets } from '../db/schema.js';

const TTL_DAYS = 7;

export async function secretRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Store a client-side-encrypted secret. The server never sees the key or plaintext.
  app.post(
    '/secrets',
    {
      config: { rateLimit: { max: 20, timeWindow: '10 minutes' } },
      schema: {
        tags: ['tools'],
        summary: 'Store an encrypted one-time secret',
        body: z.object({
          ciphertext: z.string().min(1).max(40_000),
          iv: z.string().min(1).max(64),
        }),
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      await db.delete(secrets).where(lt(secrets.expiresAt, new Date())); // lazy cleanup
      const id = randomBytes(12).toString('hex');
      const expiresAt = new Date(Date.now() + TTL_DAYS * 86_400_000);
      await db.insert(secrets).values({
        id,
        ciphertext: request.body.ciphertext,
        iv: request.body.iv,
        expiresAt,
      });
      return reply.code(201).send({ id });
    },
  );

  // Fetch AND destroy a secret. The DELETE ... RETURNING is atomic, so a secret
  // can only ever be read once (burn-after-reading), even under a race.
  app.post(
    '/secrets/:id/consume',
    {
      schema: {
        tags: ['tools'],
        summary: 'Fetch and destroy a one-time secret',
        params: z.object({ id: z.string() }),
        response: {
          200: z.object({ ciphertext: z.string(), iv: z.string() }),
          404: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const [row] = await db.delete(secrets).where(eq(secrets.id, request.params.id)).returning();
      if (!row || row.expiresAt < new Date()) {
        return reply.code(404).send({ error: 'This secret has already been viewed or has expired.' });
      }
      return { ciphertext: row.ciphertext, iv: row.iv };
    },
  );
}
