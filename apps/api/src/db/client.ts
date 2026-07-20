import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { env } from '../env.js';
import * as schema from './schema.js';

/**
 * A single shared connection pool for the process. postgres.js manages the pool
 * internally; `max` keeps us well under Postgres' connection ceiling.
 */
export const sql = postgres(env.DATABASE_URL, {
  max: env.NODE_ENV === 'test' ? 1 : 10,
  onnotice: () => {},
});

export const db = drizzle(sql, { schema });

export type Database = typeof db;
