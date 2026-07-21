import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from './env.js';
import metricsPlugin from './plugins/metrics.js';
import { healthRoutes } from './routes/health.js';
import { projectRoutes } from './routes/projects.js';
import { contactRoutes } from './routes/contact.js';
import { statsRoutes } from './routes/stats.js';
import { inspectRoutes } from './routes/inspect.js';

/**
 * Build a fully-configured Fastify instance. Kept separate from `index.ts` so
 * tests can spin up the app in-process without binding a port.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      env.NODE_ENV === 'test'
        ? false
        : {
            level: env.LOG_LEVEL,
            transport:
              env.NODE_ENV === 'development'
                ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
                : undefined,
          },
    // Generate a request id per request for traceable logs.
    genReqId: (req) => (req.headers['x-request-id'] as string) ?? crypto.randomUUID(),
    trustProxy: true,
  }).withTypeProvider<ZodTypeProvider>();

  // Zod is the single source of truth for validation AND serialization AND docs.
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // ---- Security & infra plugins ----
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
  });
  await app.register(rateLimit, {
    max: 120,
    timeWindow: '1 minute',
    // Allow docs/metrics scraping without counting against callers.
    allowList: (req) => req.url.startsWith('/docs') || req.url === '/metrics',
  });
  await app.register(metricsPlugin);

  // ---- OpenAPI docs ----
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Portfolio API',
        description:
          'The API that powers this developer portfolio. Every project, the contact ' +
          'form and the live visitor stats are served from here. Try the endpoints below.',
        version: '1.0.0',
      },
      tags: [
        { name: 'projects', description: 'Portfolio projects' },
        { name: 'tools', description: 'Useful tools for visitors' },
        { name: 'contact', description: 'Contact form' },
        { name: 'stats', description: 'Live visitor statistics' },
        { name: 'observability', description: 'Health & metrics' },
      ],
    },
    transform: jsonSchemaTransform,
  });
  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  });

  // ---- Routes ----
  await app.register(healthRoutes);
  await app.register(projectRoutes);
  await app.register(contactRoutes);
  await app.register(statsRoutes);
  await app.register(inspectRoutes);

  app.get('/', { schema: { hide: true } }, async () => ({
    name: 'portfolio-api',
    docs: '/docs',
    health: '/health',
    metrics: '/metrics',
  }));

  return app;
}
