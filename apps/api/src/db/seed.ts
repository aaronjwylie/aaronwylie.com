import { db, sql } from './client.js';
import { projects } from './schema.js';
import type { NewProject } from './schema.js';
import { waitForDb } from './wait-for-db.js';

/**
 * Seed the portfolio's project catalogue. Idempotent: re-running upserts by slug,
 * so it is safe to run on every deploy.
 *
 * 👉 EDIT ME: replace the APPIX links/press below with your real URLs.
 */
const seedProjects: NewProject[] = [
  {
    slug: 'appix',
    title: 'APPIX',
    tagline: 'A shipped mobile app — live on the App Store & Google Play, covered in the press.',
    description:
      'APPIX is a production mobile application I designed and shipped end to end. ' +
      'It is available to download on both major app stores and has been featured in ' +
      'the tech press. Replace this paragraph with a crisp description of what APPIX ' +
      'does, the scale it operates at (users, requests/day), and the backend systems ' +
      'you built to support it — APIs, data model, auth, notifications, infrastructure.',
    techStack: ['TypeScript', 'Node.js', 'REST API', 'Postgres', 'Mobile', 'CI/CD'],
    role: 'Founder / Backend & Full-Stack Engineer',
    links: {
      // 👉 Replace these placeholders with your real links.
      appStore: 'https://apps.apple.com/app/appix',
      playStore: 'https://play.google.com/store/apps/details?id=com.appix',
      website: 'https://appix.example.com',
      press: [
        { outlet: 'TechCrunch (example)', url: 'https://example.com/appix-press-1' },
        { outlet: 'Local News (example)', url: 'https://example.com/appix-press-2' },
      ],
    },
    featured: true,
    sortOrder: 100,
  },
  {
    slug: 'portfolio-api',
    title: 'This Portfolio API',
    tagline: 'The backend serving this very site — Fastify, Postgres, OpenAPI, metrics.',
    description:
      'The site you are looking at is powered by a REST API I built in TypeScript with ' +
      'Fastify and Drizzle/Postgres. It ships interactive OpenAPI docs, Prometheus-style ' +
      'metrics, health checks, rate limiting and a full test suite, and is deployed with ' +
      'Docker and CI/CD. The projects, contact form and live visitor stats you see are ' +
      'all served by it — the portfolio is itself the demo.',
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
    tagline: 'A placeholder — clone this row in seed.ts to add another showcase project.',
    description:
      'Add a standalone backend showcase here: an auth service, a rate-limited public API, ' +
      'a real-time system, a data pipeline — anything that demonstrates depth. Include the ' +
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
