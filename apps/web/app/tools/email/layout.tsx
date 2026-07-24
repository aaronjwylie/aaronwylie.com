import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Validator - syntax, MX records & disposable check',
  description:
    'Validate an email address: check syntax, look up the domain’s live MX records, and flag ' +
    'disposable or role-based addresses. A quick deliverability sanity check. A free tool by Aaron Wylie.',
  keywords: [
    'email validator',
    'email verification',
    'mx record lookup',
    'check email deliverability',
    'disposable email checker',
    'validate email address',
    'is email valid',
  ],
  alternates: { canonical: '/tools/email' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
