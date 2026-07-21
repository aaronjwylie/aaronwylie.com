import type { MetadataRoute } from 'next';

const SITE_URL = 'https://aaronwylie.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/resume',
    '/architecture',
    '/tools',
    '/tools/inspector',
    '/tools/password-check',
    '/tools/status',
    '/tools/webhook',
    '/tools/shortener',
    '/tools/secret',
    '/tools/dns',
    '/tools/qr',
  ];
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
