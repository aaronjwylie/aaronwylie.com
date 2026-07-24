import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'One-Time Secret - share a password that self-destructs',
  description:
    'Share a secret via a link that self-destructs after one view. Encrypted in your browser; the ' +
    'key never reaches the server. A free tool by Aaron Wylie.',
  keywords: ['one-time secret', 'self-destructing message', 'share password securely', 'encrypted note', 'burn after reading', 'secret link'],
  alternates: { canonical: '/tools/secret' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
