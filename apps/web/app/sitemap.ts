import type { MetadataRoute } from 'next';
import { POSTS } from '@/lib/posts';
import { CASE_STUDIES } from '@/lib/caseStudies';

const SITE_URL = 'https://aaronwylie.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/resume',
    '/blog',
    '/architecture',
    '/status',
    '/faq',
    '/uses',
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
  const caseStudies: MetadataRoute.Sitemap = CASE_STUDIES.map((c) => ({
    url: `${SITE_URL}/projects/${c.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
  return [...pages, ...posts, ...caseStudies];
}
