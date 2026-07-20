import postgres from 'postgres';
import { env } from '../env.js';

/**
 * Wait until the database accepts connections. In container orchestration the
 * app can start before DNS/Postgres are ready, so we retry with backoff instead
 * of crashing on the first transient error (e.g. DNS EAI_AGAIN, ECONNREFUSED).
 */
export async function waitForDb(attempts = 30, delayMs = 1000): Promise<void> {
  for (let i = 1; i <= attempts; i++) {
    const probe = postgres(env.DATABASE_URL, { max: 1, connect_timeout: 5, onnotice: () => {} });
    try {
      await probe`select 1`;
      await probe.end({ timeout: 5 });
      if (i > 1) console.log(`✔ database reachable after ${i} attempt(s)`);
      return;
    } catch (err) {
      await probe.end({ timeout: 1 }).catch(() => {});
      const reason = err instanceof Error ? err.message : String(err);
      console.log(`… waiting for database (attempt ${i}/${attempts}): ${reason}`);
      if (i === attempts) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}
