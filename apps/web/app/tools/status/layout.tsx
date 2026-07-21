import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Status Monitor - uptime & response time for any URL',
  description:
    'A real uptime monitor: endpoints checked every 60s with uptime % and response-time history. ' +
    'Add any URL to watch it live. A free tool by Aaron Wylie.',
  alternates: { canonical: '/tools/status' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
