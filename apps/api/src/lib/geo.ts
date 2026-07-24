import { createHash } from 'node:crypto';

/**
 * Coarse IP geolocation for the daily usage digest. Best-effort: on any error
 * or a private/local IP we return null and the view is still counted. Results
 * are cached in-memory so we hit the provider at most once per distinct IP.
 *
 * We resolve only city/country and never persist the IP itself.
 */
export interface Geo {
  city: string | null;
  country: string | null;
  countryCode: string | null;
}

const cache = new Map<string, Geo | null>();
const CACHE_MAX = 5000;

function isPrivate(ip: string): boolean {
  if (!ip) return true;
  if (ip === '::1' || ip.startsWith('127.') || ip.startsWith('::ffff:127.')) return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.')) return true;
  if (ip.startsWith('169.254.') || ip.startsWith('fe80:') || ip.startsWith('fc') || ip.startsWith('fd')) return true;
  const m = ip.match(/^172\.(\d+)\./);
  if (m && Number(m[1]) >= 16 && Number(m[1]) <= 31) return true;
  return false;
}

export async function geolocate(ip: string): Promise<Geo | null> {
  if (isPrivate(ip)) return null;
  if (cache.has(ip)) return cache.get(ip) ?? null;

  let result: Geo | null = null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 2500);
    // ip-api free tier (non-commercial): http only, 45 req/min - fine with caching.
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,city`,
      { signal: ctrl.signal },
    );
    clearTimeout(timer);
    const d = (await res.json()) as { status?: string; country?: string; countryCode?: string; city?: string };
    if (d.status === 'success') {
      result = { city: d.city || null, country: d.country || null, countryCode: d.countryCode || null };
    }
  } catch {
    result = null;
  }

  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(ip, result);
  return result;
}

/**
 * A privacy-preserving per-visitor token for counting daily uniques. It's a
 * non-reversible hash of the day + a server secret + IP + browser. Because the
 * day is mixed in, the same visitor hashes differently each day (unlinkable),
 * and without the secret it can't be reversed to an IP.
 */
export function visitorHash(ip: string, userAgent: string, day: string, secret: string): string | null {
  if (!ip) return null;
  return createHash('sha256').update(`${day}:${secret}:${ip}:${userAgent}`).digest('hex').slice(0, 16);
}

/** Best client IP behind nginx (which sets X-Real-IP). */
export function clientIp(headers: Record<string, string | string[] | undefined>, fallback: string): string {
  const real = headers['x-real-ip'];
  if (typeof real === 'string' && real) return real;
  const fwd = headers['x-forwarded-for'];
  const fwdStr = Array.isArray(fwd) ? fwd[0] : fwd;
  if (fwdStr) return fwdStr.split(',')[0]!.trim();
  return fallback;
}
