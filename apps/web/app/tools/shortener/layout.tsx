import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'URL Shortener - short links with click analytics',
  description:
    'Shorten a URL and track clicks - total, 7-day trend and top referrers. Links show a safe ' +
    'destination preview before redirecting. A free tool by Aaron Wylie.',
  alternates: { canonical: '/tools/shortener' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
