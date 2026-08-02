import { fileURLToPath } from 'node:url';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { env } from '../env.js';
import { waitForDb } from './wait-for-db.js';

/**
 * Apply all generated SQL migrations, then exit. Run in CI and on deploy before
 * the server starts. Uses its own short-lived connection (max: 1).
 */
async function main() {
  await waitForDb();
  const migrationClient = postgres(env.DATABASE_URL, { max: 1 });
  const dbm = drizzle(migrationClient);
  console.log('▶ running migrations…');
  // fileURLToPath, not .pathname: on Windows the latter yields "/C:/..." which
  // is not a usable path, so migrations are not found.
  await migrate(dbm, {
    migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)),
  });
  console.log('✔ migrations complete');
  await migrationClient.end();
}

main().catch((err) => {
  console.error('✖ migration failed', err);
  process.exit(1);
});
