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
    slug: 'add-your-next-project',
    title: 'Your Next Project',
    tagline: 'A placeholder - clone this row in seed.ts to add another showcase project.',
    description:
      'Add a standalone backend showcase here: an auth service, a rate-limited public API, ' +
      'a real-time system, a data pipeline - anything that demonstrates depth. Include the ' +
      'problem, your design decisions, and links to the code and a live demo.',
    techStack: ['TypeScript', 'Node.js'],
    role: 'Backend Engineer',
    links: { github: 'https://github.com/yourname/project' },
    featured: false,
    sortOrder: 10,
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
  console.log('✔ seed complete');
  await sql.end();
}

main().catch((err) => {
  console.error('✖ seed failed', err);
  process.exit(1);
});
