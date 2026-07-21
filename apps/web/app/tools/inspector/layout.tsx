import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Endpoint Inspector - free URL, TLS & security-header checker',
  description:
    'Inspect any URL: HTTP status, response time, redirect chain, TLS certificate expiry, and a ' +
    'security-header grade. A free developer tool by Aaron Wylie.',
  alternates: { canonical: '/tools/inspector' },
};

export default function InspectorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
