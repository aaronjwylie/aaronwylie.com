import { randomBytes } from 'node:crypto';

/** A captured inbound HTTP request. */
export interface CapturedRequest {
  id: string;
  method: string;
  path: string;
  query: Record<string, unknown>;
  headers: Record<string, unknown>;
  body: string;
  ip: string;
  at: string;
}

type Sock = { send: (data: string) => void; readyState: number; close?: () => void };

interface Bin {
  id: string;
  createdAt: number;
  expiresAt: number;
  requests: CapturedRequest[];
  sockets: Set<Sock>;
}

const WS_OPEN = 1;
const BIN_TTL_MS = 2 * 3_600_000; // 2 hours
const MAX_REQUESTS = 50;
const MAX_BINS = 200;

// Ephemeral, in-memory. Bins vanish on restart — fine for a throwaway inspector.
const bins = new Map<string, Bin>();

export function createBin(): string {
  if (bins.size >= MAX_BINS) {
    // Evict the oldest bin to stay bounded.
    let oldest: Bin | undefined;
    for (const b of bins.values()) if (!oldest || b.createdAt < oldest.createdAt) oldest = b;
    if (oldest) bins.delete(oldest.id);
  }
  const id = randomBytes(6).toString('hex');
  const now = Date.now();
  bins.set(id, { id, createdAt: now, expiresAt: now + BIN_TTL_MS, requests: [], sockets: new Set() });
  return id;
}

export function getBin(id: string): Bin | undefined {
  const b = bins.get(id);
  if (b && b.expiresAt < Date.now()) {
    bins.delete(id);
    return undefined;
  }
  return b;
}

export function addSocket(id: string, sock: Sock): boolean {
  const b = getBin(id);
  if (!b) return false;
  b.sockets.add(sock);
  return true;
}

export function removeSocket(id: string, sock: Sock): void {
  bins.get(id)?.sockets.delete(sock);
}

export function capture(
  id: string,
  data: Omit<CapturedRequest, 'id' | 'at'>,
): CapturedRequest | null {
  const b = getBin(id);
  if (!b) return null;
  const req: CapturedRequest = { ...data, id: randomBytes(4).toString('hex'), at: new Date().toISOString() };
  b.requests.unshift(req);
  if (b.requests.length > MAX_REQUESTS) b.requests.length = MAX_REQUESTS;

  const msg = JSON.stringify({ type: 'request', request: req });
  for (const s of b.sockets) {
    try {
      if (s.readyState === WS_OPEN) s.send(msg);
    } catch {
      /* ignore broken sockets */
    }
  }
  return req;
}

/** Periodic purge of expired bins. */
export function startWebhookCleanup(): void {
  setInterval(() => {
    const now = Date.now();
    for (const [id, b] of bins) if (b.expiresAt < now) bins.delete(id);
  }, 5 * 60_000).unref();
}
