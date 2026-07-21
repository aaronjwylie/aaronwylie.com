/**
 * Typed client for the portfolio API. Server Components call these functions at
 * request/build time, so the site is genuinely rendered from live API data.
 *
 * Two URLs on purpose:
 *  - PUBLIC_API_URL   — what the browser uses (baked into client bundles at build).
 *  - SERVER_API_URL   — what Server Components use at runtime. In Docker/behind a
 *                       proxy the API is reachable at an internal host (e.g.
 *                       http://api:4000) that the browser can't see, so server-side
 *                       fetches prefer API_INTERNAL_URL when set.
 */
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const SERVER_API_URL = process.env.API_INTERNAL_URL ?? PUBLIC_API_URL;

export interface Project {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  techStack: string[];
  role: string | null;
  links: {
    github?: string;
    live?: string;
    website?: string;
    docs?: string;
    appStore?: string;
    playStore?: string;
    health?: string;
    metrics?: string;
    press?: { outlet: string; url: string }[];
    videos?: { title: string; vimeoId: string }[];
  } & Record<string, unknown>;
  featured: boolean;
  sortOrder: number;
}

export interface Stats {
  totalViews: number;
  activeDays: number;
  topPaths: { path: string; views: number }[];
}

// The home page is `force-dynamic`, so fetch fresh each request — no data cache.
// Content edits (re-seeding projects) then show up immediately. Traffic is low
// and payloads tiny, so this is cheap.
async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${SERVER_API_URL}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getProjects(): Promise<Project[]> {
  try {
    const { data } = await get<{ data: Project[] }>('/projects');
    return data;
  } catch {
    return [];
  }
}

export async function getStats(): Promise<Stats | null> {
  try {
    return await get<Stats>('/stats');
  } catch {
    return null;
  }
}

// Exported for building links the *browser* follows — always the public URL.
export const apiUrl = PUBLIC_API_URL;
