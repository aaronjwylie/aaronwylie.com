import type { Metadata } from 'next';
import Link from 'next/link';
import { MockApiBuilder } from '@/components/MockApiBuilder';

export const metadata: Metadata = {
  title: 'Instant Mock API Generator',
  description:
    'Free instant mock REST API. Define a resource and get a live endpoint serving realistic, ' +
    'deterministic fake data with pagination, filtering, sorting and simulated writes. No signup. ' +
    'Built by Aaron Wylie.',
  alternates: { canonical: '/tools/mock-api' },
  keywords: [
    'mock API',
    'fake REST API',
    'mock API generator',
    'fake data API',
    'JSON placeholder',
    'test API',
    'dummy API',
  ],
};

export default function MockApiPage() {
  return (
    <div className="container-page py-16">
      <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">Instant Mock API</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        Design a resource, get a <span className="text-white">live REST endpoint</span> in seconds -
        serving realistic fake data with pagination, filtering, sorting and search. Perfect for
        prototyping a front end before the real backend exists. No signup, and the same mock always
        returns the same data.
      </p>

      <MockApiBuilder />

      {/* How it works - a little backend story + SEO copy */}
      <div className="mt-12 border-t border-white/10 pt-8">
        <p className="section-label mb-3">How it works</p>
        <div className="prose prose-invert max-w-none prose-headings:text-white prose-strong:text-white prose-a:text-accent">
          <p>
            When you create a mock, the server stores only your <strong>schema</strong> - never the
            data. Each response is generated on demand from a seed derived from your mock&apos;s id, so
            the dataset is fully <strong>deterministic</strong>: the same record always has the same
            values, yet nothing sits in a database. The API supports real querying (
            <code>?page</code>, <code>?limit</code>, <code>?sortBy</code>, <code>?order</code>,{' '}
            <code>?search</code>, and equality filters on any field), plus simulated{' '}
            <code>POST</code>/<code>PUT</code>/<code>PATCH</code>/<code>DELETE</code> that echo back
            like JSONPlaceholder. CORS is wide open, so you can call it from any app.
          </p>
          <p>
            It&apos;s part of a{' '}
            <Link href="/tools">suite of developer tools</Link> on this site, all served by the same
            documented API - you can <a href="https://aaronwylie.com/api/docs">browse the live docs</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
