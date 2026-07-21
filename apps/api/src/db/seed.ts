import { notInArray } from 'drizzle-orm';
import { db, sql } from './client.js';
import { projects } from './schema.js';
import type { NewProject } from './schema.js';
import { waitForDb } from './wait-for-db.js';

/**
 * Seed the portfolio's project catalogue. Idempotent: re-running upserts by slug,
 * so it is safe to run on every deploy.
 */
const seedProjects: NewProject[] = [
  {
    slug: 'appix',
    title: 'APPIX',
    tagline:
      'A patented live-experience broadcast platform - shipped to the App Store & Google Play, ' +
      'seen by 1M+ people at events for UFC, Disney/Pixar, Red Bull and more.',
    description:
      'APPIX is a patented live-experience platform I co-founded that broadcasts real-time, ' +
      'synchronized content to an audience’s smartphones during live events - turning a crowd’s ' +
      'phones into a coordinated second screen (synced light shows, live stats, exclusive content), ' +
      'even without cellular data or WiFi, so it keeps working in congested venues or during outages. ' +
      'What I built: the control station - in Python, running on dedicated on-site hardware - that ' +
      'drives a network of Eddystone BLE beacons (I chose Eddystone so identical signals reach iOS ' +
      'and Android natively, with no network dependency); plus the phone-side receiver logic in ' +
      'native Objective-C (iOS) and Java (Android) that detects the beacons and fires synchronized ' +
      'in-app moments in real time. Since coming out of stealth in 2019, APPIX has reached over a ' +
      'million people, powering experiences for the UFC (a custom “UFC In Action” app), Disney/Pixar’s ' +
      'Coco live event, Red Bull, Shaw, and a 55-date New Kids on the Block tour. Rated 4.0★ on the App Store.',
    techStack: [
      'Python',
      'BLE (Eddystone)',
      'Objective-C (iOS)',
      'Java (Android)',
      'Embedded Hardware',
      'Real-time Sync',
    ],
    role: 'Co-Founder & Engineer',
    links: {
      website: 'https://appixtech.com/',
      appStore: 'https://apps.apple.com/us/app/appix/id1058564165',
      playStore: 'https://play.google.com/store/apps/details?id=com.appix.appix&hl=en',
      videos: [
        { title: 'APPIX Anywhere', vimeoId: '521999610' },
        { title: 'APPIX at LA Phil 100 - Hollywood Bowl', vimeoId: '375579793' },
      ],
      press: [
        {
          outlet: 'AiThority - official launch',
          url: 'https://aithority.com/news/appix-officially-launches-incredible-broadcast-technology-that-creates-immersive-experiences-and-audience-engagement-at-concerts-and-events/',
        },
        {
          outlet: 'App Developer Magazine',
          url: 'https://appdevelopermagazine.com/business/appix/',
        },
        {
          outlet: 'Nerds and Beyond - Disney/Pixar “Coco”',
          url: 'https://www.nerdsandbeyond.com/2019/12/14/appix-teamed-up-with-disney-pixar-for-coco-live-event/',
        },
        {
          outlet: 'NAI500 - special coverage',
          url: 'https://nai500.com/blog/2020/11/whats-the-future-of-advertising-technology-nai500-special-coverage-on-appix-technologies/',
        },
      ],
    },
    featured: true,
    sortOrder: 100,
  },
  {
    slug: 'portfolio-api',
    title: 'This Portfolio API',
    tagline: 'The backend serving this very site - Fastify, Postgres, OpenAPI, metrics.',
    description:
      'The site you are looking at is powered by a REST API I built in TypeScript with ' +
      'Fastify and Drizzle/Postgres. It ships interactive OpenAPI docs, Prometheus-style ' +
      'metrics, health checks, rate limiting and a full test suite, and is deployed with ' +
      'Docker and CI/CD. The projects, contact form and live visitor stats you see are ' +
      'all served by it - the portfolio is itself the demo.',
    techStack: ['TypeScript', 'Fastify', 'Drizzle ORM', 'Postgres', 'Docker', 'OpenAPI', 'Vitest'],
    role: 'Backend Engineer',
    links: {
      docs: '/docs',
      metrics: '/metrics',
      health: '/health',
    },
    featured: true,
    sortOrder: 90,
  },
  {
    slug: 'live-streaming-platform',
    title: 'Real-Time Live Streaming Platform',
    tagline:
      'In progress - a low-latency, many-to-many live video platform with map-based ' +
      'geo-discovery, built on a WebRTC SFU.',
    description:
      'An in-progress platform for live video at scale. On the backend I am building the media ' +
      'and services layer: a WebRTC SFU that fans out low-latency broadcasts to many concurrent ' +
      'viewers, server-side recording and HLS pipelines for replay, and a geo-spatial, map-based ' +
      'discovery system that places live streams on an interactive map in real time over ' +
      'WebSockets. It ships on iOS, Android and web - TypeScript across a Node.js API, native ' +
      'iOS and Android apps (React Native) and a web client, plus a robust web-based ' +
      'administration portal for operations, moderation and configuration - all backed by ' +
      'Postgres, with containerized media servers and RTMP ingest for external broadcasters. ' +
      'The interesting work has been in real-time media: connection resilience and reconnection, ' +
      'video orientation and codec correctness across devices, and keeping viewer fan-out ' +
      'performant as concurrency grows.',
    techStack: [
      'TypeScript',
      'WebRTC / SFU',
      'Real-time Media',
      'Node.js',
      'WebSockets',
      'PostgreSQL',
      'React Native',
      'Docker',
    ],
    role: 'Founder & Engineer',
    links: {},
    featured: false,
    sortOrder: 85,
  },
  {
    slug: 'dynatrace-observability-lab',
    title: 'Dynatrace Observability Lab',
    tagline:
      'A hands-on SRE lab: full-stack observability on Kubernetes with Dynatrace - ' +
      'distributed tracing, problem detection and incident investigations.',
    description:
      'A self-directed lab where I stood up a production-style stack (Node.js/Express services ' +
      'and PostgreSQL) on a Kubernetes cluster (k3s) and instrumented it end to end with ' +
      'Dynatrace - deploying the Dynatrace Operator and OneAgent alongside an OpenTelemetry ' +
      'Collector for automatic APM, distributed tracing, metrics and logs. I then generated ' +
      'realistic incidents (memory leaks, database failures, request timeouts, CPU saturation) ' +
      'and worked the investigation flows end to end: service dependency mapping, latency ' +
      'analysis, problem detection and root-cause analysis. It documents how I approach ' +
      'production observability and SRE incident response.',
    techStack: ['Dynatrace', 'Kubernetes (k3s)', 'Docker', 'OpenTelemetry', 'Node.js', 'PostgreSQL', 'SRE'],
    role: 'Self-directed lab',
    links: { github: 'https://github.com/aaronjwylie/dynatrace-observability-lab' },
    featured: false,
    sortOrder: 80,
  },
];

async function main() {
  await waitForDb();
  console.log('▶ seeding projects…');
  for (const p of seedProjects) {
    await db
      .insert(projects)
      .values(p)
      .onConflictDoUpdate({
        target: projects.slug,
        set: {
          title: p.title,
          tagline: p.tagline,
          description: p.description,
          techStack: p.techStack,
          role: p.role,
          links: p.links,
          featured: p.featured,
          sortOrder: p.sortOrder,
          updatedAt: new Date(),
        },
      });
    console.log(`  ✓ ${p.slug}`);
  }
  // Seed is the source of truth: remove any project no longer listed above.
  const keep = seedProjects.map((p) => p.slug!);
  const removed = await db
    .delete(projects)
    .where(notInArray(projects.slug, keep))
    .returning({ slug: projects.slug });
  if (removed.length) console.log(`  ✗ pruned ${removed.map((r) => r.slug).join(', ')}`);
  console.log('✔ seed complete');
  await sql.end();
}

main().catch((err) => {
  console.error('✖ seed failed', err);
  process.exit(1);
});
