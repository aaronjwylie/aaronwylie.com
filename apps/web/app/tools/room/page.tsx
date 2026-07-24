import type { Metadata } from 'next';
import Link from 'next/link';
import { CreateRoomButton } from '@/components/CreateRoomButton';

export const metadata: Metadata = {
  title: 'Live Collaboration Room - real-time cursors & shared notes',
  description:
    'Create a real-time room and share the link. Everyone sees live cursors, a shared notepad and ' +
    'reactions instantly over WebSockets. No signup, ephemeral. A free tool by Aaron Wylie.',
  alternates: { canonical: '/tools/room' },
  keywords: [
    'real-time collaboration',
    'live cursors',
    'shared notepad',
    'websocket demo',
    'collaborative room',
    'multiplayer web app',
    'live presence',
  ],
};

export default function RoomLandingPage() {
  return (
    <div className="container-page py-16">
      <h1 className="mb-3 text-3xl font-extrabold text-white sm:text-4xl">Live Collaboration Room</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        Spin up a room, share the link, and watch it come alive: everyone&apos;s{' '}
        <span className="text-white">cursor moves in real time</span>, a shared notepad syncs as you
        type, and reactions burst across the screen. No signup, nothing stored - it&apos;s all live
        over WebSockets.
      </p>

      <div className="mb-12">
        <CreateRoomButton />
      </div>

      <div className="border-t border-white/10 pt-8">
        <p className="section-label mb-3">Why it&apos;s here</p>
        <div className="prose prose-invert max-w-none prose-headings:text-white prose-strong:text-white prose-a:text-accent">
          <p>
            Real-time, many-to-many systems are hard - and they&apos;re my specialty. This room is a
            small, honest demo of it: a single Fastify WebSocket server holds ephemeral room state in
            memory and fans out presence, cursor positions, shared text and reactions to everyone
            connected, with per-socket flood guards and automatic cleanup when the last person leaves.
          </p>
          <p>
            It&apos;s the same class of problem behind{' '}
            <Link href="/projects/appix">APPIX</Link> (synchronized content to thousands of phones at
            live events) and my{' '}
            <Link href="/projects/live-streaming-platform">live-streaming platform</Link>. Open it in
            two tabs to see it work, or send the link to a friend.
          </p>
        </div>
      </div>
    </div>
  );
}
