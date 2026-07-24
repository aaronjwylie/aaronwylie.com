/**
 * In-memory state for the real-time collaboration rooms. Rooms are ephemeral -
 * they exist only while someone is connected and vanish when the last person
 * leaves. Nothing is persisted.
 */

export interface RoomSocket {
  send(data: string): void;
  close?(): void;
  readyState?: number;
}

export interface Member {
  id: string;
  name: string;
  color: string;
  x: number; // 0..1 fraction of the shared surface
  y: number;
  socket: RoomSocket;
}

interface Room {
  text: string;
  members: Map<string, Member>;
}

const rooms = new Map<string, Room>();

export const MAX_MEMBERS = 30;
export const MAX_TEXT = 20_000;

const COLORS = [
  '#22d3ee',
  '#8b5cf6',
  '#f472b6',
  '#34d399',
  '#fbbf24',
  '#60a5fa',
  '#f87171',
  '#a78bfa',
  '#2dd4bf',
  '#fb923c',
];

export function pickColor(room: Room): string {
  const used = new Set([...room.members.values()].map((m) => m.color));
  return COLORS.find((c) => !used.has(c)) ?? COLORS[Math.floor(Math.random() * COLORS.length)]!;
}

export function getRoom(id: string): Room | undefined {
  return rooms.get(id);
}

/** Add a member, creating the room if needed. Returns false if the room is full. */
export function addMember(roomId: string, member: Member): boolean {
  let room = rooms.get(roomId);
  if (!room) {
    room = { text: '', members: new Map() };
    rooms.set(roomId, room);
  }
  if (room.members.size >= MAX_MEMBERS) return false;
  room.members.set(member.id, member);
  return true;
}

export function removeMember(roomId: string, memberId: string): void {
  const room = rooms.get(roomId);
  if (!room) return;
  room.members.delete(memberId);
  if (room.members.size === 0) rooms.delete(roomId); // GC empty room
}

export function setText(roomId: string, text: string): void {
  const room = rooms.get(roomId);
  if (room) room.text = text.slice(0, MAX_TEXT);
}

/** Public (socket-free) view of a member. */
export function publicMember(m: Member) {
  return { id: m.id, name: m.name, color: m.color, x: m.x, y: m.y };
}

export function listMembers(room: Room) {
  return [...room.members.values()].map(publicMember);
}

/** Send a payload to everyone in the room, optionally skipping one member. */
export function broadcast(roomId: string, payload: unknown, exceptId?: string): void {
  const room = rooms.get(roomId);
  if (!room) return;
  const data = JSON.stringify(payload);
  for (const m of room.members.values()) {
    if (m.id === exceptId) continue;
    try {
      m.socket.send(data);
    } catch {
      /* dead socket - it'll be cleaned up on close */
    }
  }
}

export function roomStats() {
  return { rooms: rooms.size, members: [...rooms.values()].reduce((n, r) => n + r.members.size, 0) };
}
