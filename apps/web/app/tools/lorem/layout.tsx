import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lorem Ipsum Generator - by paragraphs, words or characters',
  description:
    'Generate lorem ipsum placeholder text by paragraphs, sentences, words, characters or list ' +
    'items, as plain text or HTML. Optional classic "Lorem ipsum…" start. A free tool by Aaron Wylie.',
  keywords: [
    'lorem ipsum generator',
    'lorem ipsum',
    'placeholder text',
    'dummy text generator',
    'filler text',
    'lipsum',
    'lorem ipsum by characters',
    'lorem ipsum html',
  ],
  alternates: { canonical: '/tools/lorem' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
