import { randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { eq, lt } from 'drizzle-orm';
import { db } from '../db/client.js';
import { mockApis } from '../db/schema.js';
import {
  FIELD_CATALOG,
  FIELD_TYPE_KEYS,
  generateRecords,
  type FieldType,
  type MockConfig,
  type MockResource,
} from '../lib/mockData.js';

const API_BASE = 'https://aaronwylie.com/api';
const TTL_DAYS = 7;
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

function genId(len = 8): string {
  const b = randomBytes(len);
  let s = '';
  for (let i = 0; i < len; i++) s += ALPHABET[b[i]! % ALPHABET.length];
  return s;
}

// Query params that control the response rather than filter the data.
const RESERVED = new Set(['page', 'limit', 'sortBy', 'sort', 'order', 'search', 'delay']);

const nameSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, 'Use letters, digits, _ or -, starting with a letter.');

const configSchema = z.object({
  resources: z
    .array(
      z.object({
        name: nameSchema,
        count: z.number().int().min(1).max(1000),
        fields: z
          .array(
            z.object({
              name: nameSchema,
              type: z.enum(FIELD_TYPE_KEYS as [FieldType, ...FieldType[]]),
            }),
          )
          .min(1)
          .max(25),
      }),
    )
    .min(1)
    .max(5),
});

function endpointsFor(id: string, r: MockResource) {
  const base = `${API_BASE}/mock/${id}/${r.name}`;
  return { name: r.name, count: r.count, list: base, item: `${base}/1` };
}

async function loadMock(id: string): Promise<{ config: MockConfig; lastAccessedAt: Date } | null> {
  const [row] = await db.select().from(mockApis).where(eq(mockApis.id, id)).limit(1);
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await db.delete(mockApis).where(eq(mockApis.id, id));
    return null;
  }
  return { config: row.config as MockConfig, lastAccessedAt: row.lastAccessedAt };
}

async function touch(id: string, lastAccessedAt: Date): Promise<void> {
  // Extend the TTL on use, but avoid a write on every single request.
  if (Date.now() - lastAccessedAt.getTime() < 3_600_000) return;
  const expiresAt = new Date(Date.now() + TTL_DAYS * 86_400_000);
  await db.update(mockApis).set({ lastAccessedAt: new Date(), expiresAt }).where(eq(mockApis.id, id));
}

async function delay(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, Math.min(Math.max(0, ms), 5000)));
}

export async function mockRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // --- Field catalog for the builder UI (static route: matched before /:id) ---
  app.get('/mock/field-types', { schema: { tags: ['tools'], summary: 'Mock API field-type catalog' } }, async () => ({
    fields: FIELD_CATALOG,
  }));

  // --- Create a mock ---
  app.post(
    '/mock',
    {
      config: { rateLimit: { max: 20, timeWindow: '1 hour' } },
      schema: {
        tags: ['tools'],
        summary: 'Create an instant mock REST API',
        description:
          'Define one or more resources; get a live REST endpoint that serves realistic, ' +
          'deterministic fake data with pagination, filtering and sorting. Mocks expire after ' +
          `${TTL_DAYS} days of inactivity.`,
        body: configSchema,
      },
    },
    async (request, reply) => {
      const config = request.body as MockConfig;
      const names = config.resources.map((r) => r.name.toLowerCase());
      if (new Set(names).size !== names.length) {
        return reply.code(400).send({ error: 'Resource names must be unique.' });
      }

      // Opportunistic cleanup of anything already expired.
      await db.delete(mockApis).where(lt(mockApis.expiresAt, new Date()));

      const expiresAt = new Date(Date.now() + TTL_DAYS * 86_400_000);
      for (let attempt = 0; attempt < 5; attempt++) {
        const id = genId();
        try {
          await db.insert(mockApis).values({ id, config, expiresAt });
          return reply.code(201).send({
            id,
            baseUrl: `${API_BASE}/mock/${id}`,
            expiresAt: expiresAt.toISOString(),
            resources: config.resources.map((r) => endpointsFor(id, r)),
          });
        } catch {
          /* id collision - retry */
        }
      }
      return reply.code(500).send({ error: 'Could not allocate a mock id, please retry.' });
    },
  );

  // --- Mock metadata ---
  app.get('/mock/:id', { schema: { tags: ['tools'], summary: 'Mock API metadata' } }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const mock = await loadMock(id);
    if (!mock) return reply.code(404).send({ error: 'Mock not found or expired.' });
    void touch(id, mock.lastAccessedAt);
    return {
      id,
      baseUrl: `${API_BASE}/mock/${id}`,
      resources: mock.config.resources.map((r) => endpointsFor(id, r)),
    };
  });

  // --- List a resource (pagination / filtering / sorting / search) ---
  app.get(
    '/mock/:id/:resource',
    { config: { rateLimit: { max: 300, timeWindow: '1 minute' } }, schema: { tags: ['tools'], summary: 'List mock records' } },
    async (request, reply) => {
      const { id, resource } = request.params as { id: string; resource: string };
      const query = request.query as Record<string, string | undefined>;

      const mock = await loadMock(id);
      if (!mock) return reply.code(404).send({ error: 'Mock not found or expired.' });
      const def = mock.config.resources.find((r) => r.name === resource);
      if (!def) return reply.code(404).send({ error: `No resource "${resource}" in this mock.` });

      void touch(id, mock.lastAccessedAt);
      if (query.delay) await delay(Number(query.delay) || 0);

      let rows = generateRecords(id, def);

      // Field filters: any non-reserved query param equal to a field value.
      for (const [key, value] of Object.entries(query)) {
        if (RESERVED.has(key) || value === undefined) continue;
        rows = rows.filter((row) => String(row[key] ?? '').toLowerCase() === value.toLowerCase());
      }

      // Full-text-ish search across all string fields.
      if (query.search) {
        const needle = query.search.toLowerCase();
        rows = rows.filter((row) =>
          Object.values(row).some((v) => String(v).toLowerCase().includes(needle)),
        );
      }

      // Sorting.
      const sortBy = query.sortBy ?? query.sort;
      if (sortBy) {
        const dir = (query.order ?? 'asc').toLowerCase() === 'desc' ? -1 : 1;
        rows = [...rows].sort((a, b) => {
          const av = a[sortBy] as string | number;
          const bv = b[sortBy] as string | number;
          if (av < bv) return -1 * dir;
          if (av > bv) return 1 * dir;
          return 0;
        });
      }

      const total = rows.length;
      // Pagination (opt-in): if page or limit provided, slice.
      if (query.page || query.limit) {
        const limit = Math.min(Math.max(1, Number(query.limit) || 10), 100);
        const page = Math.max(1, Number(query.page) || 1);
        rows = rows.slice((page - 1) * limit, (page - 1) * limit + limit);
      }

      reply.header('x-total-count', String(total));
      reply.header('access-control-expose-headers', 'x-total-count');
      return rows;
    },
  );

  // --- Single record by id ---
  app.get(
    '/mock/:id/:resource/:recordId',
    { config: { rateLimit: { max: 300, timeWindow: '1 minute' } }, schema: { tags: ['tools'], summary: 'Get one mock record' } },
    async (request, reply) => {
      const { id, resource, recordId } = request.params as {
        id: string;
        resource: string;
        recordId: string;
      };
      const mock = await loadMock(id);
      if (!mock) return reply.code(404).send({ error: 'Mock not found or expired.' });
      const def = mock.config.resources.find((r) => r.name === resource);
      if (!def) return reply.code(404).send({ error: `No resource "${resource}" in this mock.` });

      const rows = generateRecords(id, def);
      const found = rows.find((row) => String(row.id) === recordId);
      if (!found) return reply.code(404).send({ error: `No ${resource} with id ${recordId}.` });
      return found;
    },
  );

  // --- Simulated writes (echo back; nothing persists, like JSONPlaceholder) ---
  const okResource = async (id: string, resource: string) => {
    const mock = await loadMock(id);
    if (!mock) return null;
    return mock.config.resources.find((r) => r.name === resource) ?? null;
  };

  app.post('/mock/:id/:resource', { schema: { tags: ['tools'], summary: 'Create a mock record (simulated)' } }, async (request, reply) => {
    const { id, resource } = request.params as { id: string; resource: string };
    const def = await okResource(id, resource);
    if (!def) return reply.code(404).send({ error: 'Mock or resource not found.' });
    const body = (request.body ?? {}) as Record<string, unknown>;
    return reply.code(201).send({ id: def.count + 1, ...body });
  });

  app.put('/mock/:id/:resource/:recordId', { schema: { tags: ['tools'], summary: 'Replace a mock record (simulated)' } }, async (request, reply) => {
    const { id, resource, recordId } = request.params as { id: string; resource: string; recordId: string };
    const def = await okResource(id, resource);
    if (!def) return reply.code(404).send({ error: 'Mock or resource not found.' });
    const body = (request.body ?? {}) as Record<string, unknown>;
    return reply.send({ id: Number(recordId) || recordId, ...body });
  });

  app.patch('/mock/:id/:resource/:recordId', { schema: { tags: ['tools'], summary: 'Update a mock record (simulated)' } }, async (request, reply) => {
    const { id, resource, recordId } = request.params as { id: string; resource: string; recordId: string };
    const def = await okResource(id, resource);
    if (!def) return reply.code(404).send({ error: 'Mock or resource not found.' });
    const rows = generateRecords(id, def);
    const existing = rows.find((row) => String(row.id) === recordId) ?? { id: Number(recordId) || recordId };
    const body = (request.body ?? {}) as Record<string, unknown>;
    return reply.send({ ...existing, ...body });
  });

  app.delete('/mock/:id/:resource/:recordId', { schema: { tags: ['tools'], summary: 'Delete a mock record (simulated)' } }, async (request, reply) => {
    const { id, resource } = request.params as { id: string; resource: string; recordId: string };
    const def = await okResource(id, resource);
    if (!def) return reply.code(404).send({ error: 'Mock or resource not found.' });
    return reply.send({});
  });
}
