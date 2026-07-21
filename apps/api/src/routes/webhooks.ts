import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  createBin,
  getBin,
  capture,
  addSocket,
  removeSocket,
} from '../services/webhookService.js';

export async function webhookRoutes(fastify: FastifyInstance) {
  // Capture ANY content type as a raw string, scoped to this plugin only.
  fastify.removeAllContentTypeParsers();
  fastify.addContentTypeParser('*', { parseAs: 'string' }, (_req, body, done) => done(null, body));

  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Create a capture bin.
  app.post(
    '/hooks',
    {
      config: { rateLimit: { max: 20, timeWindow: '5 minutes' } },
      schema: {
        tags: ['tools'],
        summary: 'Create a webhook capture bin',
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (_req, reply) => reply.code(201).send({ id: createBin() }),
  );

  // Fetch captured requests (initial load / polling fallback).
  app.get(
    '/hooks/:id/requests',
    {
      schema: {
        tags: ['tools'],
        summary: 'List captured requests for a bin',
        params: z.object({ id: z.string() }),
        response: {
          200: z.object({ requests: z.array(z.any()) }),
          404: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const b = getBin(request.params.id);
      if (!b) return reply.code(404).send({ error: 'Bin not found or expired.' });
      return { requests: b.requests };
    },
  );

  // Live stream over WebSocket.
  fastify.get('/hooks/:id/ws', { websocket: true }, (connection, req) => {
    // @fastify/websocket v10 passes the socket directly; older versions wrap it.
    const socket = ((connection as { socket?: unknown }).socket ?? connection) as {
      send: (d: string) => void;
      readyState: number;
      close?: () => void;
      on: (ev: string, cb: () => void) => void;
    };
    const id = (req.params as { id: string }).id;
    const bin = getBin(id);
    if (!bin || !addSocket(id, socket)) {
      socket.close?.();
      return;
    }
    socket.send(JSON.stringify({ type: 'snapshot', requests: bin.requests }));
    socket.on('close', () => removeSocket(id, socket));
  });

  // Capture endpoint — any method, /h/:id and /h/:id/<anything>.
  const captureHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const id = (request.params as { id: string }).id;
    const captured = capture(id, {
      method: request.method,
      path: request.url,
      query: (request.query ?? {}) as Record<string, unknown>,
      headers: request.headers as Record<string, unknown>,
      body: typeof request.body === 'string' ? request.body.slice(0, 10_000) : '',
      ip: request.ip,
    });
    if (!captured) return reply.code(404).send({ error: 'Bin not found or expired.' });
    return reply.code(200).send({ ok: true, captured: captured.id });
  };

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;
  app.route({ method: [...methods], url: '/h/:id', handler: captureHandler });
  app.route({ method: [...methods], url: '/h/:id/*', handler: captureHandler });
}
