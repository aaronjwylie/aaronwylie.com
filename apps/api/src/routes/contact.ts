import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { contactMessages } from '../db/schema.js';
import { env } from '../env.js';

export async function contactRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.post(
    '/contact',
    {
      // Tighter limit on the write endpoint to blunt spam/abuse.
      config: { rateLimit: { max: 5, timeWindow: '10 minutes' } },
      schema: {
        tags: ['contact'],
        summary: 'Submit a contact message',
        body: z.object({
          name: z.string().min(1).max(120),
          email: z.string().email().max(254),
          message: z.string().min(10).max(5000),
          // Honeypot: real users leave this empty; bots tend to fill every field.
          // Accept any value here so the handler can silently drop it — a 400 would
          // tell the bot it was detected.
          website: z.string().max(200).optional(),
        }),
        response: {
          201: z.object({ ok: z.literal(true), id: z.number() }),
          400: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { name, email, message, website } = request.body;
      if (website) {
        // Honeypot tripped — pretend success, store nothing.
        return reply.code(201).send({ ok: true as const, id: 0 });
      }
      const [row] = await db
        .insert(contactMessages)
        .values({
          name,
          email,
          message,
          userAgent: request.headers['user-agent']?.slice(0, 512) ?? null,
        })
        .returning({ id: contactMessages.id });
      request.log.info({ contactId: row!.id }, 'contact message received');
      return reply.code(201).send({ ok: true as const, id: row!.id });
    },
  );

  app.get(
    '/contact',
    {
      schema: {
        tags: ['contact'],
        summary: 'List contact messages (admin)',
        description: 'Requires the `x-admin-token` header to match ADMIN_TOKEN.',
        headers: z.object({ 'x-admin-token': z.string().optional() }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.number(),
                name: z.string(),
                email: z.string(),
                message: z.string(),
                handled: z.boolean(),
                createdAt: z.date(),
              }),
            ),
          }),
          401: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      if (request.headers['x-admin-token'] !== env.ADMIN_TOKEN) {
        return reply.code(401).send({ error: 'unauthorized' });
      }
      const rows = await db
        .select({
          id: contactMessages.id,
          name: contactMessages.name,
          email: contactMessages.email,
          message: contactMessages.message,
          handled: contactMessages.handled,
          createdAt: contactMessages.createdAt,
        })
        .from(contactMessages)
        .orderBy(desc(contactMessages.createdAt))
        .limit(100);
      return { data: rows };
    },
  );
}
