import { POSTS } from '@/lib/posts';

const SITE_URL = 'https://aaronwylie.com';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export const dynamic = 'force-static';

export function GET() {
  const items = POSTS.map(
    (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE_URL}/blog/${p.slug}</link>
      <guid>${SITE_URL}/blog/${p.slug}</guid>
      <pubDate>${new Date(`${p.date}T09:00:00Z`).toUTCString()}</pubDate>
      <description>${esc(p.description)}</description>
    </item>`,
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Aaron Wylie - Writing</title>
    <link>${SITE_URL}/blog</link>
    <description>Articles on full-stack development, backend, real-time systems, security and observability.</description>
    <language>en-ca</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
}
