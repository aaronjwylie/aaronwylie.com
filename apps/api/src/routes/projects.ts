import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { projects } from '../db/schema.js';

const ProjectSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  tagline: z.string(),
  description: z.string(),
  techStack: z.array(z.string()),
  role: z.string().nullable(),
  links: z.record(z.unknown()),
  featured: z.boolean(),
  sortOrder: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export async function projectRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.get(
    '/projects',
    {
      schema: {
        tags: ['projects'],
        summary: 'List projects',
        description: 'Returns all portfolio projects, featured first, then by sort order.',
        querystring: z.object({
          featured: z
            .enum(['true', 'false'])
            .optional()
            .describe('Filter to only featured (or non-featured) projects.'),
        }),
        response: { 200: z.object({ data: z.array(ProjectSchema) }) },
      },
    },
    async (request) => {
      const { featured } = request.query;
      const rows = await db
        .select()
        .from(projects)
        .orderBy(desc(projects.featured), desc(projects.sortOrder));
      const data =
        featured === undefined
          ? rows
          : rows.filter((r) => r.featured === (featured === 'true'));
      return { data };
    },
  );

  app.get(
    '/projects/:slug',
    {
      schema: {
        tags: ['projects'],
        summary: 'Get a project by slug',
        params: z.object({ slug: z.string() }),
        response: {
          200: z.object({ data: ProjectSchema }),
          404: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const [row] = await db
        .select()
        .from(projects)
        .where(eq(projects.slug, request.params.slug))
        .limit(1);
      if (!row) {
        return reply.code(404).send({ error: `No project with slug "${request.params.slug}"` });
      }
      return { data: row };
    },
  );
}
