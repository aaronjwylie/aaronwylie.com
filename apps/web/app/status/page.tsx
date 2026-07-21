import type { Metadata } from 'next';
import Link from 'next/link';
import { apiUrl } from '@/lib/api';
import { LiveDashboard } from '@/components/LiveDashboard';

export const metadata: Metadata = {
  title: 'Live Status & Metrics',
  description:
    "A real-time dashboard of this portfolio's own API - uptime, request volume, latency percentiles, error rate and process health, read live from its Prometheus metrics.",
  alternates: { canonical: '/status' },
};

export default function StatusPage() {
  return (
    <div className="container-page py-16">
      <p className="section-label mb-3">Observability</p>
      <h1 className="mb-4 max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
        Live status &amp; metrics
      </h1>
      <p className="mb-8 max-w-2xl text-slate-400">
        Most portfolios tell you the backend works. This one shows you. Everything below is read
        live from the portfolio API&apos;s own Prometheus metrics - the same telemetry I&apos;d put
        on a Grafana or Dynatrace board for a client system. You can also{' '}
        <a href={`${apiUrl}/metrics`} target="_blank" rel="noreferrer" className="text-accent hover:underline">
          view the raw metrics
        </a>{' '}
        or{' '}
        <Link href="/projects/dynatrace-observability-lab" className="text-accent hover:underline">
          read about my observability lab
        </Link>
        .
      </p>

      <LiveDashboard />

      <div className="mt-12 border-t border-white/10 pt-6">
        <Link href="/tools/status" className="btn-ghost">
          Monitor your own endpoints →
        </Link>
      </div>
    </div>
  );
}
