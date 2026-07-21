import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { ViewBeacon } from '@/components/ViewBeacon';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Aaron Wylie - Full-Stack Developer',
  description:
    'Front-end, back-end & full-stack developer. Builder of APPIX. This portfolio is powered by its own documented API.',
  openGraph: {
    title: 'Aaron Wylie - Full-Stack Developer',
    description: 'Front-end, back-end & full-stack developer. Builder of APPIX. Portfolio powered by its own API.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col">
        <ViewBeacon />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
