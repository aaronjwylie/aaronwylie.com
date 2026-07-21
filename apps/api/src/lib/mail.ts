import type { FastifyBaseLogger } from 'fastify';
import { env } from '../env.js';

export interface ContactNotification {
  id: number;
  name: string;
  email: string;
  message: string;
}

/** Escape user-supplied text before embedding it in the notification HTML. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Email the site owner when a contact message arrives. No-op unless
 * RESEND_API_KEY is configured, so the form works with or without email.
 * Never throws — the DB is the source of truth; email is best-effort.
 */
export async function sendContactNotification(
  msg: ContactNotification,
  log: FastifyBaseLogger,
): Promise<void> {
  if (!env.RESEND_API_KEY) return;

  const html =
    `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#111">` +
    `<h2 style="margin:0 0 12px">New portfolio contact message</h2>` +
    `<p style="margin:4px 0"><strong>Name:</strong> ${esc(msg.name)}</p>` +
    `<p style="margin:4px 0"><strong>Email:</strong> ` +
    `<a href="mailto:${esc(msg.email)}">${esc(msg.email)}</a></p>` +
    `<p style="margin:12px 0 4px"><strong>Message:</strong></p>` +
    `<p style="white-space:pre-wrap;margin:0;padding:12px;background:#f4f4f5;border-radius:8px">${esc(msg.message)}</p>` +
    `<hr style="border:none;border-top:1px solid #e4e4e7;margin:16px 0">` +
    `<p style="color:#888;font-size:12px;margin:0">Sent from the contact form on aaronwylie.com (id ${msg.id}). Reply directly to respond.</p>` +
    `</div>`;

  const text =
    `New portfolio contact message\n\n` +
    `Name: ${msg.name}\nEmail: ${msg.email}\n\nMessage:\n${msg.message}\n\n` +
    `— aaronwylie.com contact form (id ${msg.id})`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: [env.CONTACT_TO_EMAIL],
        reply_to: msg.email,
        subject: `New portfolio contact from ${msg.name}`,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      log.error({ status: res.status, body }, 'contact email failed to send');
    } else {
      log.info({ contactId: msg.id }, 'contact email sent');
    }
  } catch (err) {
    log.error(err, 'contact email threw');
  }
}
