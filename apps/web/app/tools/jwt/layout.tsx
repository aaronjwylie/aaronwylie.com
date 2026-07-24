import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JWT Decoder & Verifier - decode and verify JSON Web Tokens',
  description:
    'Decode a JWT to inspect its header and payload, check expiry, and verify the signature (HS* ' +
    'with a secret, RS*/ES*/PS* with a public key). Decoding happens in your browser. A free tool by Aaron Wylie.',
  keywords: [
    'jwt decoder',
    'jwt decode',
    'json web token decoder',
    'jwt verify',
    'decode jwt online',
    'jwt debugger',
    'jwt token decoder',
  ],
  alternates: { canonical: '/tools/jwt' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
