import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { db, sql } from '../src/db/client.js';
import { projects } from '../src/db/schema.js';

describe('projects', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    await db.delete(projects);
    await db.insert(projects).values([
      {
        slug: 'appix',
        title: 'APPIX',
        tagline: 'Shipped app.',
        description: 'A production app.',
        techStack: ['TypeScript', 'Node.js'],
        role: 'Founder',
        links: { appStore: 'https://example.com' },
        featured: true,
        sortOrder: 100,
      },
      {
        slug: 'side-thing',
        title: 'Side Thing',
        tagline: 'A smaller project.',
        description: 'Something else.',
        techStack: ['Go'],
        featured: false,
        sortOrder: 10,
      },
    ]);
  });

  afterAll(async () => {
    await db.delete(projects);
    await app.close();
  });

  it('lists projects with featured first', async () => {
    const res = await app.inject({ method: 'GET', url: '/projects' });
    expect(res.statusCode).toBe(200);
    const { data } = res.json();
    expect(data).toHaveLength(2);
    expect(data[0].slug).toBe('appix');
    expect(data[0].featured).toBe(true);
  });

  it('filters to featured only', async () => {
    const res = await app.inject({ method: 'GET', url: '/projects?featured=true' });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.every((p: { featured: boolean }) => p.featured)).toBe(true);
  });

  it('fetches a single project by slug', async () => {
    const res = await app.inject({ method: 'GET', url: '/projects/appix' });
    expect(res.statusCode).toBe(200);
    expect(res.json().data.title).toBe('APPIX');
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await app.inject({ method: 'GET', url: '/projects/nope' });
    expect(res.statusCode).toBe(404);
  });
});
