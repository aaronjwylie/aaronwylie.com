import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Résumé - Aaron Wylie, Full-Stack Developer',
  description:
    'Résumé of Aaron Wylie - Vancouver-based full-stack developer and technical founder. 20+ years ' +
    'building software, founder of APPIX and DigiCoyote Software.',
  alternates: { canonical: '/resume' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
