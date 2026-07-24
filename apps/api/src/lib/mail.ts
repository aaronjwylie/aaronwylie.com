import type { FastifyBaseLogger } from 'fastify';
import { env } from '../env.js';

export interface ContactNotification {
  id: number;
  name: string;
  email: string;
  message: string;
  budget?: string | null;
}

/** Human-readable label for a stored budget token. */
const BUDGET_LABELS: Record<string, string> = {
  under_10k: 'Under $10,000',
  '10k_50k': '$10,000 - $50,000',
  '50k_100k': '$50,000 - $100,000',
  over_100k: 'Over $100,000',
  unsure: "Don't know yet",
};

function budgetLabel(token?: string | null): string | null {
  if (!token) return null;
  return BUDGET_LABELS[token] ?? token;
}

/** Escape user-supplied text before embedding it in the notification HTML. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface UsageDigest {
  day: string;
  totalViews: number;
  uniqueVisitors: number;
  toolViews: number;
  locatedViews: number;
  topTools: { path: string; views: number }[];
  topPages: { path: string; views: number }[];
  topCountries: { country: string; views: number }[];
  topCities: { label: string; views: number }[];
}

function rows(items: { label: string; views: number }[]): string {
  if (items.length === 0) return '<tr><td style="padding:4px 0;color:#888">-</td></tr>';
  return items
    .map(
      (i) =>
        `<tr><td style="padding:3px 12px 3px 0">${esc(i.label)}</td><td style="padding:3px 0;text-align:right;font-weight:600">${i.views}</td></tr>`,
    )
    .join('');
}

/**
 * Send the once-a-day usage digest. Aggregate only (no IPs, no per-visitor
 * rows). No-op unless RESEND_API_KEY is set. Never throws.
 */
export async function sendUsageDigest(d: UsageDigest, log: FastifyBaseLogger): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;

  const section = (title: string, items: { label: string; views: number }[]) =>
    `<p style="margin:18px 0 6px;font-weight:700">${title}</p>` +
    `<table style="border-collapse:collapse;font-size:14px">${rows(items)}</table>`;

  const html =
    `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#111;max-width:560px">` +
    `<h2 style="margin:0 0 4px">Portfolio daily digest</h2>` +
    `<p style="margin:0 0 16px;color:#666">${esc(d.day)} (UTC)</p>` +
    `<p style="margin:0;font-size:15px"><strong>${d.uniqueVisitors}</strong> unique visitors · ` +
    `<strong>${d.totalViews}</strong> page views · ` +
    `<strong>${d.toolViews}</strong> on tools · ${d.locatedViews} geo-located</p>` +
    section('Top tools', d.topTools.map((t) => ({ label: t.path, views: t.views }))) +
    section('Top pages', d.topPages.map((t) => ({ label: t.path, views: t.views }))) +
    section('Top countries', d.topCountries.map((t) => ({ label: t.country, views: t.views }))) +
    section('Top cities', d.topCities.map((t) => ({ label: t.label, views: t.views }))) +
    `<hr style="border:none;border-top:1px solid #e4e4e7;margin:18px 0">` +
    `<p style="color:#888;font-size:12px;margin:0">Aggregate only - no IPs stored. From aaronwylie.com.</p>` +
    `</div>`;

  const text =
    `Portfolio daily digest - ${d.day} (UTC)\n\n` +
    `${d.uniqueVisitors} unique visitors, ${d.totalViews} page views, ${d.toolViews} on tools, ${d.locatedViews} geo-located\n\n` +
    `Top tools:\n${d.topTools.map((t) => `  ${t.path}: ${t.views}`).join('\n') || '  -'}\n\n` +
    `Top countries:\n${d.topCountries.map((t) => `  ${t.country}: ${t.views}`).join('\n') || '  -'}\n\n` +
    `Top cities:\n${d.topCities.map((t) => `  ${t.label}: ${t.views}`).join('\n') || '  -'}\n`;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: [env.CONTACT_TO_EMAIL],
        subject: `Portfolio digest - ${d.day} (${d.totalViews} views)`,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      log.error({ status: res.status, body }, 'usage digest failed to send');
      return false;
    }
    log.info({ day: d.day }, 'usage digest sent');
    return true;
  } catch (err) {
    log.error(err, 'usage digest threw');
    return false;
  }
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

  const budget = budgetLabel(msg.budget);

  const html =
    `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#111">` +
    `<h2 style="margin:0 0 12px">New portfolio contact message</h2>` +
    `<p style="margin:4px 0"><strong>Name:</strong> ${esc(msg.name)}</p>` +
    `<p style="margin:4px 0"><strong>Email:</strong> ` +
    `<a href="mailto:${esc(msg.email)}">${esc(msg.email)}</a></p>` +
    (budget ? `<p style="margin:4px 0"><strong>Budget:</strong> ${esc(budget)}</p>` : '') +
    `<p style="margin:12px 0 4px"><strong>Message:</strong></p>` +
    `<p style="white-space:pre-wrap;margin:0;padding:12px;background:#f4f4f5;border-radius:8px">${esc(msg.message)}</p>` +
    `<hr style="border:none;border-top:1px solid #e4e4e7;margin:16px 0">` +
    `<p style="color:#888;font-size:12px;margin:0">Sent from the contact form on aaronwylie.com (id ${msg.id}). Reply directly to respond.</p>` +
    `</div>`;

  const text =
    `New portfolio contact message\n\n` +
    `Name: ${msg.name}\nEmail: ${msg.email}\n` +
    (budget ? `Budget: ${budget}\n` : '') +
    `\nMessage:\n${msg.message}\n\n` +
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
