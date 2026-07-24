import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { resolveMx } from 'node:dns/promises';

// A short list of common disposable/temporary email domains.
const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'tempmail.com', 'temp-mail.org',
  'throwawaymail.com', 'yopmail.com', 'getnada.com', 'trashmail.com', 'sharklasers.com',
  'maildrop.cc', 'dispostable.com', 'fakeinbox.com', 'mailnesia.com', 'mohmal.com',
  'emailondeck.com', 'moakt.com', 'tempinbox.com', 'spamgourmet.com', 'mytemp.email',
]);

// Local-parts that usually denote a shared/role mailbox, not a person.
const ROLE = new Set([
  'admin', 'info', 'support', 'sales', 'contact', 'help', 'noreply', 'no-reply', 'postmaster',
  'webmaster', 'abuse', 'office', 'hello', 'team', 'billing', 'careers', 'jobs', 'marketing',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function emailRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/email/validate',
    {
      config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
      schema: {
        tags: ['tools'],
        summary: 'Validate an email address (syntax, MX, disposable, role)',
        querystring: z.object({ email: z.string().min(1).max(320) }),
      },
    },
    async (request) => {
      const email = request.query.email.trim();
      const syntaxValid = email.length <= 254 && EMAIL_RE.test(email);
      const at = email.lastIndexOf('@');
      const local = at > 0 ? email.slice(0, at) : '';
      const domain = at > 0 ? email.slice(at + 1).toLowerCase() : '';

      let hasMx = false;
      let mx: { exchange: string; priority: number }[] = [];
      if (syntaxValid) {
        try {
          const records = await resolveMx(domain);
          mx = records
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 8)
            .map((r) => ({ exchange: r.exchange, priority: r.priority }));
          hasMx = mx.length > 0;
        } catch {
          hasMx = false;
        }
      }

      return {
        email,
        syntaxValid,
        local,
        domain,
        hasMx,
        mx,
        disposable: DISPOSABLE.has(domain),
        roleBased: ROLE.has(local.toLowerCase()),
        deliverable: syntaxValid && hasMx,
      };
    },
  );
}
