'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiUrl } from '@/lib/api';

interface PublicMember {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}
type Members = Record<string, PublicMember>;
interface Floater {
  key: number;
  emoji: string;
  x: number;
  y: number;
  color: string;
}

const REACTIONS = ['🎉', '👍', '🔥', '❤️', '😂', '👀'];
const NAME_KEY = 'aw_room_name';

function randomName() {
  const animals = ['Fox', 'Otter', 'Panda', 'Hawk', 'Wolf', 'Koala', 'Lynx', 'Heron', 'Bison', 'Crane'];
  return `${animals[Math.floor(Math.random() * animals.length)]} ${Math.floor(1000 + Math.random() * 9000)}`;
}

export function LiveRoom({ roomId }: { roomId: string }) {
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed' | 'full'>('connecting');
  const [youId, setYouId] = useState('');
  const [members, setMembers] = useState<Members>({});
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const [floaters, setFloaters] = useState<Floater[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const lastCursor = useRef(0);
  const floatId = useRef(0);
  const nameRef = useRef('');

  const send = useCallback((obj: unknown) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
  }, []);

  const spawnFloater = useCallback((emoji: string, x: number, y: number, color: string) => {
    const key = ++floatId.current;
    setFloaters((prev) => [...prev, { key, emoji, x, y, color }]);
    setTimeout(() => setFloaters((prev) => prev.filter((f) => f.key !== key)), 1600);
  }, []);

  // Establish name once (persisted per browser).
  useEffect(() => {
    let n = '';
    try {
      n = localStorage.getItem(NAME_KEY) ?? '';
    } catch {
      /* ignore */
    }
    if (!n) n = randomName();
    nameRef.current = n;
    setName(n);
  }, []);

  // Connect the WebSocket.
  useEffect(() => {
    const wsUrl = `${apiUrl.replace(/^http/, 'ws')}/room/${roomId}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('open');
      if (nameRef.current) ws.send(JSON.stringify({ t: 'name', name: nameRef.current }));
    };
    ws.onclose = () => setStatus((s) => (s === 'full' ? 'full' : 'closed'));
    ws.onmessage = (ev) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(ev.data);
      } catch {
        return;
      }
      switch (msg.type) {
        case 'full':
          setStatus('full');
          break;
        case 'init': {
          setYouId(msg.you as string);
          setText((msg.text as string) ?? '');
          const map: Members = {};
          for (const m of (msg.members as PublicMember[]) ?? []) map[m.id] = m;
          setMembers(map);
          break;
        }
        case 'join':
          setMembers((prev) => ({ ...prev, [(msg.member as PublicMember).id]: msg.member as PublicMember }));
          break;
        case 'leave':
          setMembers((prev) => {
            const next = { ...prev };
            delete next[msg.id as string];
            return next;
          });
          break;
        case 'cursor':
          setMembers((prev) => {
            const m = prev[msg.id as string];
            if (!m) return prev;
            return { ...prev, [m.id]: { ...m, x: msg.x as number, y: msg.y as number } };
          });
          break;
        case 'name':
          setMembers((prev) => {
            const m = prev[msg.id as string];
            if (!m) return prev;
            return { ...prev, [m.id]: { ...m, name: msg.name as string } };
          });
          break;
        case 'text':
          setText((msg.text as string) ?? '');
          break;
        case 'reaction': {
          // Read latest members without a stale closure.
          setMembers((prev) => {
            const m = prev[msg.id as string];
            spawnFloater(msg.emoji as string, msg.x as number, msg.y as number, m?.color ?? '#22d3ee');
            return prev;
          });
          break;
        }
        default:
          break;
      }
    };

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const onMouseMove = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastCursor.current < 40) return; // throttle ~25/s
    lastCursor.current = now;
    const rect = surfaceRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    send({ t: 'cursor', x, y });
  };

  const onText = (v: string) => {
    setText(v);
    send({ t: 'text', text: v });
  };

  const onName = (v: string) => {
    setName(v);
    nameRef.current = v;
    try {
      localStorage.setItem(NAME_KEY, v);
    } catch {
      /* ignore */
    }
    send({ t: 'name', name: v });
  };

  const react = (emoji: string) => {
    const me = members[youId];
    send({ t: 'reaction', emoji });
    spawnFloater(emoji, me?.x ?? 0.5, me?.y ?? 0.5, me?.color ?? '#22d3ee');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const others = Object.values(members).filter((m) => m.id !== youId);
  const me = members[youId];

  return (
    <div className="space-y-6">
      {/* Top bar: presence + share */}
      <div className="card flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <StatusDot status={status} />
          <div className="flex -space-x-2">
            {Object.values(members)
              .slice(0, 10)
              .map((m) => (
                <span
                  key={m.id}
                  title={m.name + (m.id === youId ? ' (you)' : '')}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink-900 text-xs font-bold text-ink-950"
                  style={{ background: m.color }}
                >
                  {m.name.charAt(0).toUpperCase()}
                </span>
              ))}
          </div>
          <span className="text-sm text-slate-400">
            {Object.keys(members).length} here
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={name}
            onChange={(e) => onName(e.target.value.slice(0, 40))}
            aria-label="Your name"
            className="w-36 rounded-lg border border-white/10 bg-ink-950 px-3 py-1.5 text-sm text-white focus:border-accent focus:outline-none"
          />
          <button type="button" onClick={copyLink} className="btn-primary">
            {copied ? 'Link copied' : 'Share room'}
          </button>
        </div>
      </div>

      {status === 'full' && (
        <div className="card text-center text-slate-300">This room is full (30 people). Try another link.</div>
      )}

      {/* Shared surface: cursors + reactions live here */}
      <div
        ref={surfaceRef}
        onMouseMove={onMouseMove}
        className="card relative min-h-[22rem] cursor-none overflow-hidden"
      >
        <p className="section-label mb-3">Shared notepad · everyone edits live</p>
        <textarea
          value={text}
          onChange={(e) => onText(e.target.value)}
          placeholder="Start typing - everyone in the room sees it instantly. (Last edit wins.)"
          className="h-56 w-full resize-none rounded-lg border border-white/10 bg-ink-950/80 p-4 font-mono text-sm text-white focus:border-accent focus:outline-none"
        />

        {/* Other people's live cursors */}
        {others.map((m) => (
          <div
            key={m.id}
            className="pointer-events-none absolute z-20 transition-all duration-75 ease-linear"
            style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill={m.color} className="drop-shadow">
              <path d="M4 2l7 18 2.5-7L20 10 4 2z" />
            </svg>
            <span
              className="ml-3 inline-block rounded px-1.5 py-0.5 text-xs font-semibold text-ink-950"
              style={{ background: m.color }}
            >
              {m.name}
            </span>
          </div>
        ))}

        {/* Floating reactions */}
        {floaters.map((f) => (
          <span
            key={f.key}
            className="reaction-float pointer-events-none absolute z-30 text-2xl"
            style={{ left: `${f.x * 100}%`, top: `${f.y * 100}%` }}
          >
            {f.emoji}
          </span>
        ))}

        {/* Your own cursor label (so it's obvious which colour is you) */}
        {me && (
          <div className="pointer-events-none absolute bottom-3 right-3 z-20 flex items-center gap-2 rounded-full bg-ink-950/70 px-3 py-1 text-xs text-slate-300 backdrop-blur">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: me.color }} />
            you
          </div>
        )}
      </div>

      {/* Reactions */}
      <div className="card flex flex-wrap items-center gap-3">
        <span className="section-label mr-1">React</span>
        {REACTIONS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => react(e)}
            className="rounded-lg border border-white/10 px-3 py-2 text-xl transition hover:-translate-y-0.5 hover:border-accent/40"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, { c: string; t: string }> = {
    connecting: { c: 'bg-amber-400', t: 'Connecting…' },
    open: { c: 'bg-emerald-500', t: 'Live' },
    closed: { c: 'bg-rose-500', t: 'Disconnected' },
    full: { c: 'bg-rose-500', t: 'Full' },
  };
  const s = map[status] ?? map.connecting!;
  return (
    <span className="flex items-center gap-2 text-sm text-slate-400">
      <span className="relative flex h-2.5 w-2.5">
        {status === 'open' && (
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.c} opacity-75`} />
        )}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${s.c}`} />
      </span>
      {s.t}
    </span>
  );
}
