import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ViewBeacon } from '@/components/ViewBeacon';
import { Analytics } from '@/components/Analytics';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const SITE_URL = 'https://aaronwylie.com';
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Aaron Wylie - Full-Stack Developer in Vancouver, Canada',
    template: '%s · Aaron Wylie',
  },
  description:
    'Aaron Wylie is a Vancouver-based front-end, back-end and full-stack developer, working ' +
    'remotely with clients worldwide. Builder of APPIX. This portfolio is powered by its own documented API.',
  keywords: [
    'Aaron Wylie',
    'Vancouver developer',
    'Vancouver full-stack developer',
    'Vancouver web developer',
    'Vancouver software developer',
    'full-stack developer',
    'back-end developer',
    'front-end developer',
    'TypeScript',
    'Node.js',
    'React',
    'Next.js',
    'APPIX',
  ],
  authors: [{ name: 'Aaron Wylie', url: SITE_URL }],
  creator: 'Aaron Wylie',
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: SITE_URL,
    siteName: 'Aaron Wylie',
    title: 'Aaron Wylie - Full-Stack Developer in Vancouver, Canada',
    description:
      'Vancouver-based front-end, back-end and full-stack developer, working remotely with ' +
      'clients worldwide. Builder of APPIX. Portfolio powered by its own API.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aaron Wylie - Full-Stack Developer in Vancouver, Canada',
    description: 'Vancouver-based front-end, back-end and full-stack developer. Builder of APPIX.',
  },
  category: 'technology',
};

// Structured data — helps Google understand who/what/where (local + entity SEO).
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: 'Aaron Wylie',
      url: SITE_URL,
      jobTitle: 'Full-Stack Developer',
      description:
        'Front-end, back-end and full-stack developer based in Vancouver, Canada, working ' +
        'remotely with clients worldwide. Co-founder of APPIX.',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Vancouver',
        addressRegion: 'BC',
        addressCountry: 'CA',
      },
      knowsAbout: [
        'Full-Stack Development',
        'Back-End Engineering',
        'Front-End Development',
        'TypeScript',
        'Node.js',
        'React',
        'Next.js',
        'PostgreSQL',
        'WebRTC',
        'Real-time Systems',
        'Kubernetes',
        'Observability',
        'REST APIs',
      ],
      sameAs: ['https://github.com/aaronjwylie'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Aaron Wylie',
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#person` },
      inLanguage: 'en-CA',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ViewBeacon />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        {GA_ID ? <Analytics gaId={GA_ID} /> : null}
      </body>
    </html>
  );
}
