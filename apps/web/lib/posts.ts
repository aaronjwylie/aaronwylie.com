export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO (YYYY-MM-DD)
  tags: string[];
}

/** URL-safe slug for a tag, e.g. "Next.js" -> "next-js". */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** All distinct tags with their post counts, most-used first. */
export function allTags(): { tag: string; slug: string; count: number }[] {
  const counts = new Map<string, { tag: string; count: number }>();
  for (const p of POSTS) {
    for (const tag of p.tags) {
      const key = tagSlug(tag);
      const entry = counts.get(key);
      if (entry) entry.count += 1;
      else counts.set(key, { tag, count: 1 });
    }
  }
  return [...counts.entries()]
    .map(([slug, { tag, count }]) => ({ slug, tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Posts carrying a given tag slug (newest first, as POSTS is ordered). */
export function postsByTag(slug: string): PostMeta[] {
  return POSTS.filter((p) => p.tags.some((t) => tagSlug(t) === slug));
}

/** The display name of a tag from its slug (first match wins). */
export function tagFromSlug(slug: string): string | undefined {
  return allTags().find((t) => t.slug === slug)?.tag;
}

// Newest first. The article body for each lives in content/blog/<slug>.md
export const POSTS: PostMeta[] = [
  {
    slug: 'realtime-transport-polling-sse-websockets',
    title: 'Polling, SSE or WebSockets: Picking a Transport for Live Updates',
    description:
      'Two tools on this site push live updates, and only one of them warranted a socket. How to choose between polling, Server-Sent Events and WebSockets.',
    date: '2026-08-02',
    tags: ['Real-time', 'WebSockets', 'Node.js', 'Architecture'],
  },
  {
    slug: 'wordpress-to-modern-stack-nextjs-api',
    title: 'From WordPress to a Modern Stack: Rebuilding with Next.js & a Real API',
    description:
      'When to migrate off WordPress, what you gain, and how to do it without a big-bang rewrite - preserving SEO along the way.',
    date: '2026-07-14',
    tags: ['WordPress', 'Next.js', 'Migration', 'SEO'],
  },
  {
    slug: 'observability-101-dynatrace-kubernetes-lab',
    title: 'Observability 101: Lessons from a Dynatrace + Kubernetes Lab',
    description:
      'Metrics, logs and traces - and how building a lab to break things on purpose teaches you to find root causes fast.',
    date: '2026-06-09',
    tags: ['Observability', 'Dynatrace', 'Kubernetes', 'SRE'],
  },
  {
    slug: 'eddystone-ble-beacons-broadcast-to-phones',
    title: "Broadcasting to a Crowd's Phones with Eddystone BLE Beacons",
    description:
      'How BLE beacons push signals to thousands of phones with no network - the tech behind APPIX, and why broadcast beats connections at scale.',
    date: '2026-05-12',
    tags: ['BLE', 'Eddystone', 'Real-time', 'Mobile'],
  },
  {
    slug: 'scaling-live-video-webrtc-sfu',
    title: 'Scaling Live Video: An Intro to WebRTC SFUs',
    description:
      'Why peer-to-peer WebRTC falls apart with an audience, and how a Selective Forwarding Unit makes low-latency one-to-many streaming possible.',
    date: '2026-04-14',
    tags: ['WebRTC', 'SFU', 'Live Video', 'Real-time'],
  },
  {
    slug: 'realtime-webhook-inspector-fastify-websockets',
    title: 'A Real-Time Webhook Inspector with Fastify & WebSockets',
    description:
      'Build a tool that gives you a unique URL and streams incoming HTTP requests to your browser live - Fastify, WebSockets, and the nginx gotcha.',
    date: '2026-03-10',
    tags: ['Fastify', 'WebSockets', 'Node.js', 'Tools'],
  },
  {
    slug: 'k-anonymity-password-breach-checks',
    title: 'How k-Anonymity Password Breach Checks Work (and Building One)',
    description:
      'Check whether a password has been breached without ever sending it - the clever cryptographic trick behind Have I Been Pwned, and how to build on it.',
    date: '2026-02-10',
    tags: ['Security', 'Cryptography', 'Privacy'],
  },
  {
    slug: 'preventing-ssrf-nodejs-outbound-requests',
    title: 'Preventing SSRF in Node.js: Safe Outbound Requests from User Input',
    description:
      'Any time your server fetches a user-supplied URL you risk SSRF. How the attack works and how to shut it down - including the redirect gotcha.',
    date: '2026-01-13',
    tags: ['Security', 'Node.js', 'Backend'],
  },
  {
    slug: 'security-headers-a-grade-csp-hsts',
    title: 'Getting an A on Security Headers: CSP, HSTS & Friends',
    description:
      'The six response headers that close common browser-side attacks, how to add them at nginx, and how to write a CSP that does not break your site.',
    date: '2025-12-09',
    tags: ['Security', 'nginx', 'CSP'],
  },
  {
    slug: 'zod-single-source-of-truth-fastify-openapi',
    title: 'One Zod Schema, Three Jobs: Validation, Serialization & OpenAPI Docs',
    description:
      'Make one schema validate requests, serialize responses, and generate your OpenAPI docs - so the docs can never drift from the code.',
    date: '2025-11-11',
    tags: ['TypeScript', 'Fastify', 'Zod', 'APIs'],
  },
  {
    slug: 'deploy-fullstack-digitalocean-docker-nginx',
    title: 'Deploying a Full-Stack App to DigitalOcean with Docker, nginx & HTTPS',
    description:
      'A reproducible, one-command deploy of a full-stack app to a $6 Droplet - Docker Compose, nginx reverse proxy, free HTTPS, and the ufw/Docker trap.',
    date: '2025-10-14',
    tags: ['DevOps', 'Docker', 'nginx', 'DigitalOcean'],
  },
];

export function getPost(slug: string): PostMeta | undefined {
  return POSTS.find((p) => p.slug === slug);
}
