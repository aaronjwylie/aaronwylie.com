import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Résumé - Aaron Wylie, Full-Stack Developer',
  description:
    'Résumé of Aaron Wylie - Vancouver-based full-stack developer and technical founder. 20+ years ' +
    'building software, inventor of APPIX live-experience and public safety alerting, founder of ' +
    'DigiCoyote Software.',
  alternates: { canonical: '/resume' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
