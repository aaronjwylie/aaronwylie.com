import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QR Code Generator - free SVG & PNG QR codes',
  description:
    'Generate a QR code for any URL or text, server-side, as a crisp SVG or PNG. A free tool by Aaron Wylie.',
  keywords: ['QR code generator', 'free QR code', 'SVG QR code', 'PNG QR code', 'URL to QR code', 'QR code maker'],
  alternates: { canonical: '/tools/qr' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
