import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import QRCode from 'qrcode';

export async function qrRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/qr',
    {
      config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
      schema: {
        tags: ['tools'],
        summary: 'Generate a QR code (SVG) for text or a URL',
        body: z.object({ text: z.string().min(1).max(2000) }),
        response: {
          200: z.object({ svg: z.string() }),
          400: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      try {
        const svg = await QRCode.toString(request.body.text, {
          type: 'svg',
          margin: 1,
          width: 320,
          errorCorrectionLevel: 'M',
          color: { dark: '#0d1526', light: '#ffffff' },
        });
        return { svg };
      } catch {
        return reply.code(400).send({ error: 'Could not generate a QR code for that input.' });
      }
    },
  );
}
