import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Uses - the tools & gear I work with',
  description:
    'The editor, languages, infrastructure, hardware and services Aaron Wylie uses day to day as a full-stack developer.',
  alternates: { canonical: '/uses' },
};

const GROUPS: { title: string; items: { name: string; note: string }[] }[] = [
  {
    title: 'Editor & terminal',
    items: [
      { name: 'VS Code', note: 'my main editor for web and TypeScript work' },
      { name: 'PyCharm', note: 'when I’m deep in Python' },
      { name: 'Terminal / SSH', note: 'a lot of my deploys and debugging live here' },
      { name: 'Postman', note: 'poking at APIs' },
      { name: 'pgAdmin', note: 'when I want a GUI on Postgres' },
    ],
  },
  {
    title: 'Languages & frameworks',
    items: [
      { name: 'TypeScript', note: 'the default for almost everything I build now' },
      { name: 'React / React Native / Next.js', note: 'web and mobile front ends' },
      { name: 'Node.js / Fastify', note: 'fast, typed backends' },
      { name: 'Python / Django', note: 'services, scripting, hardware control' },
    ],
  },
  {
    title: 'Data & infrastructure',
    items: [
      { name: 'PostgreSQL', note: 'my go-to database' },
      { name: 'Docker', note: 'everything I ship is containerized' },
      { name: 'Kubernetes', note: 'for orchestrated, multi-service workloads' },
      { name: 'nginx', note: 'reverse proxy, TLS, security headers' },
      { name: 'Redis', note: 'caching and fast ephemeral state' },
    ],
  },
  {
    title: 'Cloud & hosting',
    items: [
      { name: 'DigitalOcean', note: 'Droplets for simple, predictable hosting' },
      { name: 'AWS', note: 'when a project needs the broader toolbox' },
      { name: 'Hetzner', note: 'great price-to-performance for heavier boxes' },
    ],
  },
  {
    title: 'Observability & collaboration',
    items: [
      { name: 'Dynatrace', note: 'distributed tracing and root-cause analysis' },
      { name: 'GitHub', note: 'source control and CI/CD' },
      { name: 'Jira / Confluence', note: 'tracking and docs on team projects' },
    ],
  },
  {
    title: 'Hardware & tinkering',
    items: [
      { name: 'Raspberry Pi', note: 'prototyping and small always-on services' },
      { name: 'Arduino / ESP32', note: 'microcontrollers and firmware' },
      { name: 'BeagleBone', note: 'when I need more Linux on a small board' },
    ],
  },
  {
    title: 'Design & media',
    items: [
      { name: 'Figma', note: 'UI and layout' },
      { name: 'Photoshop', note: 'image work' },
      { name: 'DaVinci Resolve', note: 'video editing' },
    ],
  },
];

export default function UsesPage() {
  return (
    <div className="container-page py-16">
      <p className="section-label mb-4">Uses</p>
      <h1 className="mb-3 text-4xl font-extrabold text-white">What I use</h1>
      <p className="mb-10 max-w-2xl text-lg text-slate-400">
        The tools, languages, infrastructure and gear I reach for day to day. Always evolving - this
        is a snapshot of the current setup.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g.title} className="card">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-accent-cyan">
              {g.title}
            </h2>
            <ul className="space-y-3">
              {g.items.map((it) => (
                <li key={it.name} className="text-sm">
                  <span className="font-semibold text-white">{it.name}</span>
                  <span className="text-slate-400"> - {it.note}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
