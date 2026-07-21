import type { MetadataRoute } from 'next';
import { POSTS } from '@/lib/posts';

const SITE_URL = 'https://aaronwylie.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/resume',
    '/blog',
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
  const pages: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
  const posts: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.date,
    changeFrequency: 'yearly',
    priority: 0.6,
  }));
  return [...pages, ...posts];
}
