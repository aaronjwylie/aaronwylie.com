import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HTTP Request Builder - a mini Postman in your browser',
  description:
    'Build and send any HTTP request (GET/POST/PUT/PATCH/DELETE) with custom headers and a body, ' +
    'then see the full response - status, headers, timing and body. SSRF-safe. A free tool by Aaron Wylie.',
  keywords: [
    'http request builder',
    'online api tester',
    'rest client online',
    'postman alternative',
    'send http request online',
    'curl online',
    'test api endpoint',
  ],
  alternates: { canonical: '/tools/http' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
