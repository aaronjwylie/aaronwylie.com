import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { db } from '../src/db/client.js';
import { contactMessages } from '../src/db/schema.js';
import { env } from '../src/env.js';

describe('contact', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
    await db.delete(contactMessages);
  });
  afterAll(async () => {
    await db.delete(contactMessages);
    await app.close();
  });

  it('accepts a valid message and persists it', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/contact',
      payload: { name: 'Jane', email: 'jane@example.com', message: 'Hello there, I have a role for you!' },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().ok).toBe(true);
    expect(res.json().id).toBeGreaterThan(0);
  });

  it('rejects an invalid email', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/contact',
      payload: { name: 'Jane', email: 'not-an-email', message: 'A long enough message here.' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('rejects a too-short message', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/contact',
      payload: { name: 'Jane', email: 'jane@example.com', message: 'hi' },
    });
    expect(res.statusCode).toBe(400);
  });

  it('silently drops honeypot submissions', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/contact',
      payload: {
        name: 'Bot',
        email: 'bot@example.com',
        message: 'Buy my stuff, buy my stuff!',
        website: 'http://spam.example',
      },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().id).toBe(0);
  });

  it('guards the admin list endpoint', async () => {
    const unauth = await app.inject({ method: 'GET', url: '/contact' });
    expect(unauth.statusCode).toBe(401);

    const auth = await app.inject({
      method: 'GET',
      url: '/contact',
      headers: { 'x-admin-token': env.ADMIN_TOKEN },
    });
    expect(auth.statusCode).toBe(200);
    // One real message persisted above (honeypot + invalid ones excluded).
    expect(auth.json().data.length).toBe(1);
  });
});
