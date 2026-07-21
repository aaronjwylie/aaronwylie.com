export interface CaseStudyMeta {
  slug: string;
  title: string;
  description: string;
  tags: string[];
}

// Projects that have a full case-study write-up (content/projects/<slug>.md).
export const CASE_STUDIES: CaseStudyMeta[] = [
  {
    slug: 'appix',
    title: 'APPIX - Broadcasting Live Experiences to a Crowd',
    description:
      'A patented platform that pushes synchronized, real-time content to thousands of phones at live events - even with no usable network. Used by Disney, UFC and Red Bull.',
    tags: ['BLE', 'Real-time', 'Mobile', 'Distributed Systems'],
  },
  {
    slug: 'live-streaming-platform',
    title: 'A Real-Time Live-Streaming Platform',
    description:
      'An in-progress platform for low-latency, many-to-many live video with map-based discovery, on a WebRTC SFU - shipping to iOS, Android and web.',
    tags: ['WebRTC', 'Real-time', 'React Native', 'Node.js'],
  },
  {
    slug: 'developer-tools-suite',
    title: 'A Suite of Backend-Powered Developer Tools',
    description:
      'Eight genuinely useful tools built into this site - each exercising a different backend muscle, from WebSockets to k-anonymity to SQL analytics.',
    tags: ['TypeScript', 'Fastify', 'WebSockets', 'Security'],
  },
  {
    slug: 'dynatrace-observability-lab',
    title: 'A Dynatrace + Kubernetes Observability Lab',
    description:
      'A hands-on lab simulating production incidents on a Kubernetes stack, instrumented with Dynatrace - built to practice finding root causes across metrics, logs and traces.',
    tags: ['Observability', 'Dynatrace', 'Kubernetes', 'SRE'],
  },
  {
    slug: 'portfolio-api',
    title: 'This Portfolio, Powered by Its Own API',
    description:
      'The site you are on runs on a documented Fastify + Postgres API I built - projects, tools, stats and contact all served from it, deployed with Docker, nginx and CI/CD.',
    tags: ['TypeScript', 'Fastify', 'Postgres', 'DevOps'],
  },
];

export const CASE_STUDY_SLUGS = new Set(CASE_STUDIES.map((c) => c.slug));

export function getCaseStudy(slug: string): CaseStudyMeta | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
