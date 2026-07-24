import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cron Expression Explainer - describe a cron & see next runs',
  description:
    'Paste a cron expression to get a plain-English description and the next five run times in any ' +
    'timezone. Understand crontab schedules at a glance. A free tool by Aaron Wylie.',
  keywords: [
    'cron expression',
    'crontab',
    'cron parser',
    'cron expression generator',
    'cron schedule explained',
    'crontab guru alternative',
    'cron next run',
  ],
  alternates: { canonical: '/tools/cron' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
