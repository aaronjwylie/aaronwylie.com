import type { MetadataRoute } from 'next';

const SITE_URL = 'https://aaronwylie.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/architecture',
    '/tools',
    '/tools/inspector',
    '/tools/password-check',
    '/tools/status',
  ];
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
