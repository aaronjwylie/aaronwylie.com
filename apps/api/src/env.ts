import { z } from 'zod';

/**
 * Validate process configuration once, at boot. A misconfigured server should
 * refuse to start with a clear error rather than fail mysteriously at runtime.
 */
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:3000')
    .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)),
  ADMIN_TOKEN: z.string().min(1).default('change-me-in-production'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  // Email (Resend). Contact-form notifications are sent only when RESEND_API_KEY
  // is set — the form still works and persists messages without it.
  RESEND_API_KEY: z.string().default(''),
  CONTACT_TO_EMAIL: z.string().email().default('aaronwyliework@gmail.com'),
  // "Display Name <address>". onboarding@resend.dev works with no domain setup
  // (test mode only sends to the Resend account owner); switch to
  // contact@aaronwylie.com once the domain is verified in Resend.
  CONTACT_FROM_EMAIL: z.string().default('Portfolio Contact <onboarding@resend.dev>'),
  // Public base path the API is reachable at (nginx serves it under /api in
  // production; it's at the root in local dev). Used for the OpenAPI server URL
  // so Swagger "Try it out" hits the right URL.
  API_PUBLIC_PATH: z.string().default('/'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:');
  // eslint-disable-next-line no-console
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
