import fp from 'fastify-plugin';
import { Registry, collectDefaultMetrics, Histogram, Counter } from 'prom-client';

/**
 * Prometheus metrics. Exposes:
 *   - default process/node metrics (memory, event loop lag, gc…)
 *   - http_request_duration_seconds  (histogram, labelled by method/route/status)
 *   - http_requests_total            (counter)
 * Scrape at GET /metrics.
 */
export default fp(async function metricsPlugin(app) {
  const registry = new Registry();
  registry.setDefaultLabels({ app: 'portfolio-api' });
  collectDefaultMetrics({ register: registry });

  const httpHistogram = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'] as const,
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    registers: [registry],
  });

  const httpCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'] as const,
    registers: [registry],
  });

  app.addHook('onResponse', async (request, reply) => {
    // Prefer the matched route pattern (e.g. /projects/:slug) over the raw URL
    // so metrics stay low-cardinality.
    const route = request.routeOptions?.url ?? request.url.split('?')[0] ?? 'unknown';
    const labels = {
      method: request.method,
      route,
      status_code: String(reply.statusCode),
    };
    httpCounter.inc(labels);
    httpHistogram.observe(labels, reply.elapsedTime / 1000);
  });

  app.get(
    '/metrics',
    {
      schema: {
        tags: ['observability'],
        summary: 'Prometheus metrics',
        description: 'Prometheus-formatted metrics for scraping.',
      },
    },
    async (_req, reply) => {
      reply.header('Content-Type', registry.contentType);
      return registry.metrics();
    },
  );
});
