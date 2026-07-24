'use client';

import { useRouter } from 'next/navigation';

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

function newRoomId(len = 10): string {
  let s = '';
  const buf = new Uint32Array(len);
  crypto.getRandomValues(buf);
  for (let i = 0; i < len; i++) s += CHARS[buf[i]! % CHARS.length];
  return s;
}

export function CreateRoomButton() {
  const router = useRouter();
  return (
    <button type="button" onClick={() => router.push(`/tools/room/${newRoomId()}`)} className="btn-primary">
      Create a room →
    </button>
  );
}
