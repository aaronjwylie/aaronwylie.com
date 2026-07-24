import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Unix Timestamp / Epoch Converter',
  description:
    'Convert a Unix timestamp (seconds or milliseconds) to a human-readable date and back - ISO 8601, ' +
    'UTC, your local time and relative time. Live current epoch. A free tool by Aaron Wylie.',
  keywords: [
    'unix timestamp',
    'epoch converter',
    'unix time converter',
    'timestamp to date',
    'epoch to date',
    'current unix timestamp',
    'milliseconds to date',
  ],
  alternates: { canonical: '/tools/timestamp' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
