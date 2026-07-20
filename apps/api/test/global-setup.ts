import { execSync } from 'node:child_process';

/**
 * Runs once before the whole test suite: apply migrations against the test
 * database. DATABASE_URL must point at a disposable test DB (see CI / README).
 */
export default async function setup() {
  process.env.NODE_ENV = 'test';
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set for tests (point it at a test database).');
  }
  execSync('tsx src/db/migrate.ts', { stdio: 'inherit' });
}
