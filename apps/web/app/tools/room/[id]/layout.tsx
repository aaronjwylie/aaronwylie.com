import type { Metadata } from 'next';

// Individual rooms are ephemeral and private-ish - don't index them.
export const metadata: Metadata = {
  title: 'Live Room',
  description: 'A real-time collaboration room with live cursors, a shared notepad and reactions.',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
