import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Password Breach Checker - is your password compromised?',
  description:
    'Check whether a password appears in a known data breach, privately. Your password is hashed ' +
    'in the browser and never sent (k-anonymity via HaveIBeenPwned). A free tool by Aaron Wylie.',
  alternates: { canonical: '/tools/password-check' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
