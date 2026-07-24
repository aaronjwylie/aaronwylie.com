'use client';

import Link from 'next/link';
import { LiveRoom } from '@/components/LiveRoom';

export default function RoomPage({ params }: { params: { id: string } }) {
  return (
    <div className="container-page py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <span className="text-xs text-slate-500">
          room <code className="text-slate-300">{params.id}</code>
        </span>
        <Link href="/tools/room" className="text-sm font-medium text-accent hover:underline">
          + New room
        </Link>
      </div>
      <h1 className="mb-2 text-2xl font-extrabold text-white sm:text-3xl">Live Room</h1>
      <p className="mb-8 max-w-2xl text-slate-400">
        Share this page&apos;s URL - anyone who opens it joins instantly. Move your mouse, type in the
        notepad, and react.
      </p>
      <LiveRoom roomId={params.id} />
    </div>
  );
}
