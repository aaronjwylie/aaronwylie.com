import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Webhook / Request Inspector - capture HTTP requests live',
  description:
    'Get a unique URL and watch incoming HTTP requests in real time over a WebSocket - method, ' +
    'headers, query and body. A free tool for testing webhooks and integrations, by Aaron Wylie.',
  alternates: { canonical: '/tools/webhook' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
