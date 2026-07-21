import net from 'node:net';
import dns from 'node:dns/promises';
import tls from 'node:tls';

/** Thrown for user-facing (400) problems — bad input, unsafe target, etc. */
export class InspectError extends Error {}

// ---------------------------------------------------------------------------
// SSRF protection
// This endpoint makes outbound requests to a user-supplied URL, so it must
// refuse to touch private/loopback/link-local/cloud-metadata addresses — both
// for the initial host AND for every redirect hop.
// ---------------------------------------------------------------------------

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const o = Number(p);
    if (!Number.isInteger(o) || o < 0 || o > 255) return null;
    n = ((n << 8) | o) >>> 0;
  }
  return n;
}

function inRangeV4(ip: number, base: string, bits: number): boolean {
  const b = ipv4ToInt(base);
  if (b === null) return false;
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ip & mask) === (b & mask);
}

function isPrivateV4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n === null) return true; // unparseable → treat as unsafe
  return (
    inRangeV4(n, '0.0.0.0', 8) ||
    inRangeV4(n, '10.0.0.0', 8) ||
    inRangeV4(n, '100.64.0.0', 10) || // CGNAT
    inRangeV4(n, '127.0.0.0', 8) || // loopback
    inRangeV4(n, '169.254.0.0', 16) || // link-local + cloud metadata (169.254.169.254)
    inRangeV4(n, '172.16.0.0', 12) ||
    inRangeV4(n, '192.0.0.0', 24) ||
    inRangeV4(n, '192.168.0.0', 16) ||
    inRangeV4(n, '198.18.0.0', 15) ||
    inRangeV4(n, '224.0.0.0', 4) || // multicast
    inRangeV4(n, '240.0.0.0', 4) // reserved
  );
}

function isPrivateV6(ip: string): boolean {
  const lower = ip.toLowerCase().split('%')[0] ?? ip; // strip zone id
  if (lower === '::1' || lower === '::') return true;
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped && mapped[1]) return isPrivateV4(mapped[1]);
  const firstHextet = parseInt(lower.split(':')[0] || '0', 16);
  if (firstHextet >= 0xfc00 && firstHextet <= 0xfdff) return true; // ULA fc00::/7
  if (firstHextet >= 0xfe80 && firstHextet <= 0xfebf) return true; // link-local fe80::/10
  return false;
}

export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateV4(ip);
  if (net.isIPv6(ip)) return isPrivateV6(ip);
  return true; // unknown format → unsafe
}

/** Validate a URL is http(s) and does not resolve to a private/reserved IP. */
export async function assertSafeUrl(raw: string): Promise<URL> {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new InspectError('That does not look like a valid URL.');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new InspectError('Only http:// and https:// URLs are supported.');
  }
  const host = u.hostname;
  if (!host) throw new InspectError('URL is missing a host.');

  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new InspectError('Refusing to inspect private or reserved addresses.');
    return u;
  }
  let addrs: { address: string }[];
  try {
    addrs = await dns.lookup(host, { all: true });
  } catch {
    throw new InspectError(`Could not resolve "${host}".`);
  }
  if (!addrs.length) throw new InspectError(`"${host}" did not resolve to any address.`);
  for (const a of addrs) {
    if (isPrivateIp(a.address)) {
      throw new InspectError('Refusing to inspect a host that resolves to a private/reserved address.');
    }
  }
  return u;
}

// ---------------------------------------------------------------------------
// Security-header grading
// ---------------------------------------------------------------------------

const HEADER_CHECKS: { key: string; label: string; weight: number }[] = [
  { key: 'strict-transport-security', label: 'Strict-Transport-Security (HSTS)', weight: 25 },
  { key: 'content-security-policy', label: 'Content-Security-Policy', weight: 25 },
  { key: 'x-content-type-options', label: 'X-Content-Type-Options', weight: 15 },
  { key: 'x-frame-options', label: 'X-Frame-Options', weight: 15 },
  { key: 'referrer-policy', label: 'Referrer-Policy', weight: 10 },
  { key: 'permissions-policy', label: 'Permissions-Policy', weight: 10 },
];

function gradeSecurity(headers: Record<string, string>) {
  let score = 0;
  const checks = HEADER_CHECKS.map((c) => {
    const present = headers[c.key] !== undefined;
    if (present) score += c.weight;
    return { label: c.label, present };
  });
  const grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 55 ? 'C' : score >= 30 ? 'D' : 'F';
  return { grade, score, checks };
}

// ---------------------------------------------------------------------------
// TLS certificate inspection
// ---------------------------------------------------------------------------

export interface TlsInfo {
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  authorized: boolean;
  authorizationError: string | null;
}

/** Certificate DN fields can be string or string[] — normalise to a string. */
function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function getCertificate(hostname: string, port: number): Promise<TlsInfo | null> {
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: hostname, port, servername: hostname, rejectUnauthorized: false, timeout: 8000 },
      () => {
        const c = socket.getPeerCertificate();
        const authorized = socket.authorized;
        const authorizationError = socket.authorized
          ? null
          : (socket.authorizationError?.toString() ?? 'unauthorized');
        socket.end();
        if (!c || !c.valid_to) {
          resolve(null);
          return;
        }
        const validTo = new Date(c.valid_to);
        const daysRemaining = Math.floor((validTo.getTime() - Date.now()) / 86_400_000);
        resolve({
          issuer: first(c.issuer?.O) || first(c.issuer?.CN) || 'Unknown',
          subject: first(c.subject?.CN) || hostname,
          validFrom: c.valid_from,
          validTo: c.valid_to,
          daysRemaining,
          authorized,
          authorizationError,
        });
      },
    );
    socket.on('error', () => resolve(null));
    socket.on('timeout', () => {
      socket.destroy();
      resolve(null);
    });
  });
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export interface InspectResult {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  statusText: string;
  ok: boolean;
  timingMs: number;
  redirects: { url: string; status: number }[];
  server: string | null;
  headers: Record<string, string>;
  tls: TlsInfo | null;
  security: { grade: string; score: number; checks: { label: string; present: boolean }[] };
}

export async function inspectUrl(raw: string): Promise<InspectResult> {
  const startUrl = (await assertSafeUrl(raw)).toString();
  let current = startUrl;
  const redirects: { url: string; status: number }[] = [];
  const maxHops = 5;
  let res: Response | null = null;
  let timingMs = 0;

  for (let i = 0; i <= maxHops; i++) {
    if (i > 0) await assertSafeUrl(current); // re-check each redirect target (SSRF via 3xx)
    const t0 = Date.now();
    let r: Response;
    try {
      r = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        signal: AbortSignal.timeout(8000),
        headers: { 'user-agent': 'aaronwylie.com endpoint-inspector' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'request failed';
      throw new InspectError(`Request failed: ${msg}`);
    }
    timingMs = Date.now() - t0;
    const loc = r.headers.get('location');
    if (r.status >= 300 && r.status < 400 && loc && i < maxHops) {
      await r.body?.cancel().catch(() => {});
      redirects.push({ url: current, status: r.status });
      current = new URL(loc, current).toString();
      continue;
    }
    res = r;
    break;
  }
  if (!res) throw new InspectError('Too many redirects.');
  await res.body?.cancel().catch(() => {});

  const headers: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const finalUrl = new URL(current);
  const tls =
    finalUrl.protocol === 'https:'
      ? await getCertificate(finalUrl.hostname, Number(finalUrl.port) || 443)
      : null;

  return {
    requestedUrl: startUrl,
    finalUrl: current,
    status: res.status,
    statusText: res.statusText,
    ok: res.ok,
    timingMs,
    redirects,
    server: headers['server'] ?? null,
    headers,
    tls,
    security: gradeSecurity(headers),
  };
}
