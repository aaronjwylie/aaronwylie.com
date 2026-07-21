import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DNS & WHOIS Lookup - records and registration for any domain',
  description:
    'Look up a domain’s DNS records (A, AAAA, CNAME, MX, NS, TXT) and registration details ' +
    '(registrar, created, expiry) via RDAP. A free developer tool by Aaron Wylie.',
  alternates: { canonical: '/tools/dns' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
