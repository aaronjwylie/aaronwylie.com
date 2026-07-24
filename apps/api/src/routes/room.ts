import { randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import {
  addMember,
  broadcast,
  getRoom,
  listMembers,
  MAX_TEXT,
  pickColor,
  publicMember,
  removeMember,
  setText,
  type Member,
  type RoomSocket,
} from '../services/roomService.js';

const ROOM_ID_RE = /^[a-z0-9]{6,16}$/;

function num01(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export async function roomRoutes(fastify: FastifyInstance) {
  fastify.get('/room/:id/ws', { websocket: true }, (connection, req) => {
    // @fastify/websocket v10 passes the socket directly; older versions wrap it.
    const socket = (((connection as { socket?: unknown }).socket ?? connection) as RoomSocket & {
      on(ev: string, cb: (...a: unknown[]) => void): void;
    });

    const roomId = (req.params as { id: string }).id;
    if (!ROOM_ID_RE.test(roomId)) {
      socket.close?.();
      return;
    }

    const memberId = randomBytes(8).toString('hex');
    const member: Member = { id: memberId, name: 'Guest', color: '#22d3ee', x: 0.5, y: 0.5, socket };

    // Assign a colour distinct from current members, then join.
    const existing = getRoom(roomId);
    member.color = existing ? pickColor(existing) : '#22d3ee';
    if (!addMember(roomId, member)) {
      socket.send(JSON.stringify({ type: 'full' }));
      socket.close?.();
      return;
    }
    const room = getRoom(roomId)!;

    // Send the newcomer the current state, then tell everyone else they joined.
    socket.send(
      JSON.stringify({ type: 'init', you: memberId, text: room.text, members: listMembers(room) }),
    );
    broadcast(roomId, { type: 'join', member: publicMember(member) }, memberId);

    // Basic flood guard: cap messages per second per socket.
    let windowStart = 0;
    let inWindow = 0;

    socket.on('message', (raw: unknown) => {
      const now = Date.now();
      if (now - windowStart > 1000) {
        windowStart = now;
        inWindow = 0;
      }
      if (++inWindow > 120) return; // drop excess

      let msg: { t?: string; x?: unknown; y?: unknown; text?: unknown; name?: unknown; emoji?: unknown };
      try {
        msg = JSON.parse(String(raw));
      } catch {
        return;
      }

      switch (msg.t) {
        case 'cursor': {
          member.x = num01(msg.x);
          member.y = num01(msg.y);
          broadcast(roomId, { type: 'cursor', id: memberId, x: member.x, y: member.y }, memberId);
          break;
        }
        case 'text': {
          const text = String(msg.text ?? '').slice(0, MAX_TEXT);
          setText(roomId, text);
          broadcast(roomId, { type: 'text', text, by: memberId }, memberId);
          break;
        }
        case 'name': {
          member.name = String(msg.name ?? 'Guest').slice(0, 40) || 'Guest';
          broadcast(roomId, { type: 'name', id: memberId, name: member.name });
          break;
        }
        case 'reaction': {
          const emoji = String(msg.emoji ?? '').slice(0, 8);
          if (emoji) {
            broadcast(roomId, { type: 'reaction', id: memberId, emoji, x: member.x, y: member.y });
          }
          break;
        }
        default:
          break;
      }
    });

    socket.on('close', () => {
      removeMember(roomId, memberId);
      broadcast(roomId, { type: 'leave', id: memberId });
    });
  });
}
