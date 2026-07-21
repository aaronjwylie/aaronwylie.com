import type { Metadata } from 'next';
import Link from 'next/link';
import type { SVGProps } from 'react';
import {
  TerminalIcon,
  ShieldIcon,
  ActivityIcon,
  ZapIcon,
  LinkIcon,
  LockIcon,
  GlobeIcon,
  QrIcon,
} from '@/components/icons';
import { ContactCallout } from '@/components/ContactCallout';

export const metadata: Metadata = {
  title: 'Developer Tools',
  description:
    'A small suite of free, backend-powered developer tools built by Aaron Wylie - endpoint ' +
    'inspector, password breach checker, and more.',
  alternates: { canonical: '/tools' },
};

type Tool = {
  href: string;
  title: string;
  desc: string;
  Icon: (p: SVGProps<SVGSVGElement>) => JSX.Element;
  gradient: string;
};

const TOOLS: Tool[] = [
  {
    href: '/tools/shortener',
    title: 'URL Shortener',
    desc: 'Shorten a link and track clicks - total, a 7-day trend and top referrers, computed in SQL. Links show a safe destination preview before redirecting.',
    Icon: LinkIcon,
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    href: '/tools/qr',
    title: 'QR Code Generator',
    desc: 'Turn any URL or text into a crisp QR code, generated server-side. Download as SVG or PNG.',
    Icon: QrIcon,
    gradient: 'from-teal-500 to-emerald-600',
  },
  {
    href: '/tools/dns',
    title: 'DNS & WHOIS Lookup',
    desc: 'Resolve a domain’s DNS records (A, AAAA, CNAME, MX, NS, TXT) and registration details (registrar, created, expiry) via RDAP.',
    Icon: GlobeIcon,
    gradient: 'from-sky-500 to-cyan-600',
  },
  {
    href: '/tools/password-check',
    title: 'Password Breach Checker',
    desc: 'Check if a password appears in a known data breach - privately. Hashed in your browser, only a 5-char prefix is sent (k-anonymity).',
    Icon: ShieldIcon,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    href: '/tools/status',
    title: 'Live Status Monitor',
    desc: 'A real uptime monitor - endpoints checked every 60s with uptime % and response-time history. Add any URL to watch it live for 24h.',
    Icon: ActivityIcon,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    href: '/tools/secret',
    title: 'One-Time Secret',
    desc: 'Share a password or note via a link that self-destructs after one view. Encrypted in your browser - the key never reaches the server.',
    Icon: LockIcon,
    gradient: 'from-indigo-500 to-violet-600',
  },
  {
    href: '/tools/webhook',
    title: 'Webhook / Request Inspector',
    desc: 'Get a unique URL and watch incoming HTTP requests land in real time over a WebSocket - method, headers, query and body.',
    Icon: ZapIcon,
    gradient: 'from-fuchsia-500 to-purple-600',
  },
  {
    href: '/tools/inspector',
    title: 'Endpoint Inspector',
    desc: 'HTTP status, response time, redirect chain, TLS certificate and a security-header grade for any URL. SSRF-safe.',
    Icon: TerminalIcon,
    gradient: 'from-cyan-500 to-sky-600',
  },
];

export default function ToolsPage() {
  return (
    <div className="container-page py-16">
      <p className="section-label mb-4">Tools</p>
      <h1 className="mb-3 text-4xl font-extrabold text-white">Developer tools</h1>
      <p className="mb-10 max-w-2xl text-lg text-slate-400">
        A small suite of free tools, each served by my own API. Built to be genuinely useful - and
        to show the backend behind them.
      </p>

      <div className="mb-10">
        <ContactCallout />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <Link key={t.href} href={t.href} className="card group">
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${t.gradient}`}
            >
              <t.Icon className="h-7 w-7 text-white" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-white group-hover:text-accent">{t.title}</h2>
            <p className="text-sm leading-relaxed text-slate-400">{t.desc}</p>
            <span className="mt-4 inline-block text-sm font-semibold text-accent">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
