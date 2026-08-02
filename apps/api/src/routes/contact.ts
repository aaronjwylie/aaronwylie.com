import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { contactMessages } from '../db/schema.js';
import { env } from '../env.js';
import { sendContactNotification } from '../lib/mail.js';

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
          // Optional project-budget band chosen from the form dropdown.
          budget: z
            .enum(['under_10k', '10k_50k', '50k_100k', 'over_100k', 'unsure'])
            .optional(),
          // Honeypot: real users leave this empty; bots tend to fill every field.
          // Accept any value here so the handler can silently drop it - a 400 would
          // tell the bot it was detected.
          website: z.string().max(200).optional(),
          // Explicit human confirmation from the form. Required, and checked
          // here rather than only in the browser so the box cannot simply be
          // deleted client-side.
          notARobot: z.literal(true),
        }),
        response: {
          201: z.object({ ok: z.literal(true), id: z.number() }),
          400: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { name, email, message, budget, website } = request.body;
      if (website) {
        // Honeypot tripped - pretend success, store nothing.
        return reply.code(201).send({ ok: true as const, id: 0 });
      }
      const [row] = await db
        .insert(contactMessages)
        .values({
          name,
          email,
          message,
          budget: budget ?? null,
          userAgent: request.headers['user-agent']?.slice(0, 512) ?? null,
        })
        .returning({ id: contactMessages.id });
      request.log.info({ contactId: row!.id }, 'contact message received');
      // Fire-and-forget email notification; the message is already persisted.
      void sendContactNotification(
        { id: row!.id, name, email, message, budget: budget ?? null },
        request.log,
      );
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
                budget: z.string().nullable(),
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
          budget: contactMessages.budget,
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
