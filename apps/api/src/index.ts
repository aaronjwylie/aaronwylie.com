import { buildApp } from './app.js';
import { env } from './env.js';
import { sql } from './db/client.js';

/**
 * Process entrypoint. Boots the HTTP server and wires graceful shutdown so
 * in-flight requests drain and the DB pool closes cleanly on SIGTERM/SIGINT.
 */
async function main() {
  const app = await buildApp();

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'shutting down…');
    try {
      await app.close();
      await sql.end({ timeout: 5 });
      process.exit(0);
    } catch (err) {
      app.log.error(err, 'error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  try {
    await app.listen({ port: env.API_PORT, host: env.HOST });
    app.log.info(`📚 API docs at http://localhost:${env.API_PORT}/docs`);
  } catch (err) {
    app.log.error(err, 'failed to start');
    process.exit(1);
  }
}

void main();
