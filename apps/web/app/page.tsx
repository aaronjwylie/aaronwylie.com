import Link from 'next/link';
import { getProjects, getStats, apiUrl } from '@/lib/api';
import { ProjectCard } from '@/components/ProjectCard';
import { ContactForm } from '@/components/ContactForm';
import { ContactCallout } from '@/components/ContactCallout';
import { StarIcon, LayersIcon, MailIcon, TerminalIcon, ShieldIcon, CodeIcon } from '@/components/icons';

// Technologies used across past and current work.
const TECH_GROUPS: { category: string; items: string[] }[] = [
  { category: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'PHP', 'Java', 'Objective-C', 'SQL', 'Bash'] },
  { category: 'Frontend', items: ['React', 'React Native', 'Next.js', 'Tailwind CSS'] },
  { category: 'Backend', items: ['Node.js', 'Fastify', 'Django', 'REST APIs', 'WebSockets'] },
  { category: 'Databases', items: ['PostgreSQL', 'MySQL', 'Redis'] },
  { category: 'DevOps & Cloud', items: ['Docker', 'Kubernetes', 'nginx', 'Linux', 'CI/CD', 'DigitalOcean'] },
  { category: 'Platforms & more', items: ['WordPress', 'WebRTC', 'BLE'] },
];

// Render on every request so live visitor stats and project edits are always
// current. For a low-traffic portfolio this is cheap; switch to `revalidate`
// (ISR) if you'd rather cache.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [projects, stats] = await Promise.all([getProjects(), getStats()]);
  const flagship = projects.find((p) => p.slug === 'appix');
  const rest = projects.filter((p) => p.slug !== 'appix');

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden pt-20 pb-16">
        {/* Generative glow backdrop */}
        <div className="glow-blob animate-drift left-[-8%] top-0 h-72 w-72 bg-accent-cyan/25" aria-hidden="true" />
        <div
          className="glow-blob animate-drift right-[-6%] top-20 h-96 w-96 bg-accent-violet/25"
          style={{ animationDelay: '-8s' }}
          aria-hidden="true"
        />
        <div className="container-page">
          <div className="flex flex-col-reverse items-start gap-10 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="section-label mb-4">Front End · Back End · Full-Stack Developer</p>
              <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-6xl">
                I build <span className="gradient-text">software that ships</span> - front to back,
                and this site runs on it.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-slate-400">
                I&apos;m a Vancouver-based full-stack developer working remotely with clients
                worldwide - comfortable across the front end, the back end, and the infrastructure
                in between - with a soft spot for clean APIs and reliable data models. The projects, stats and contact form below are all served by an API I built
                in TypeScript &amp; Postgres - you can{' '}
                <a href={`${apiUrl}/docs`} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                  browse its live docs
                </a>
                .
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="#projects" className="btn-primary">
                  See my work
                </Link>
                <a href={`${apiUrl}/docs`} target="_blank" rel="noreferrer" className="btn-ghost">
                  Explore the API ↗
                </a>
              </div>
            </div>
            <div className="shrink-0 md:pl-6">
              <div className="relative">
                <div className="glow-blob inset-0 h-full w-full bg-accent/25" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/headshot.jpg"
                  alt="Aaron Wylie"
                  width={288}
                  height={288}
                  className="relative h-44 w-44 rounded-full object-cover object-top shadow-2xl ring-4 ring-accent/30 sm:h-56 sm:w-56 md:h-72 md:w-72"
                />
              </div>
            </div>
          </div>

          {/* Live stats strip - proof it's backed by a real DB. */}
          {stats && (
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4">
              <Stat label="Page views" value={stats.totalViews} />
              <Stat label="Active days" value={stats.activeDays} />
              <Stat label="Projects" value={projects.length} />
            </dl>
          )}
        </div>
      </section>

      {/* ---------- Contact callout ---------- */}
      <div className="container-page pb-4 pt-2">
        <ContactCallout />
      </div>

      {/* ---------- Flagship ---------- */}
      {flagship && (
        <section className="container-page py-10">
          <p className="section-label mb-4 flex items-center gap-2">
            <StarIcon className="h-4 w-4" /> Flagship project
          </p>
          <ProjectCard project={flagship} />
        </section>
      )}

      {/* ---------- Other projects ---------- */}
      <section id="projects" className="container-page py-10 scroll-mt-20">
        <p className="section-label mb-4 flex items-center gap-2">
          <LayersIcon className="h-4 w-4" /> More projects
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {rest.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
        {projects.length === 0 && (
          <p className="text-slate-400">
            The API isn&apos;t reachable right now - start it with{' '}
            <code className="font-mono text-accent">npm run dev</code>.
          </p>
        )}
      </section>

      {/* ---------- Technologies ---------- */}
      <section className="container-page py-10">
        <p className="section-label mb-4 flex items-center gap-2">
          <CodeIcon className="h-4 w-4" /> Technologies
        </p>
        <p className="mb-6 max-w-2xl text-slate-400">
          A mix of what I build with today and what I&apos;ve shipped with over the years - across
          the front end, the back end, and the infrastructure underneath.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TECH_GROUPS.map((g) => (
            <div key={g.category} className="card">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-accent-cyan">
                {g.category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {g.items.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-slate-400">
          Don&apos;t see your project&apos;s technology here?{' '}
          <Link href="/#contact" className="font-medium text-accent hover:underline">
            Try me
          </Link>{' '}
          - I pick up new stacks fast and I&apos;ll get it done.
        </p>
      </section>

      {/* ---------- Tools ---------- */}
      <section className="container-page py-10">
        <div className="mb-4 flex items-center justify-between">
          <p className="section-label flex items-center gap-2">
            <TerminalIcon className="h-4 w-4" /> Tools you can use
          </p>
          <Link href="/tools" className="text-sm font-semibold text-accent hover:underline">
            See all →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <Link href="/tools/inspector" className="card group">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600">
              <TerminalIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-1 text-lg font-bold text-white group-hover:text-accent">
              Endpoint Inspector
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              Status, response time, TLS certificate and a security-header grade for any URL.
            </p>
          </Link>
          <Link href="/tools/password-check" className="card group">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <ShieldIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-1 text-lg font-bold text-white group-hover:text-accent">
              Password Breach Checker
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              See if a password appears in a known breach - privately, via k-anonymity.
            </p>
          </Link>
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section id="contact" className="container-page py-16 scroll-mt-20">
        <p className="section-label mb-4 flex items-center gap-2">
          <MailIcon className="h-4 w-4" /> Get in touch
        </p>
        <h2 className="mb-6 max-w-xl text-2xl font-bold text-white">
          Hiring for a front-end, back-end or full-stack role? Send a message - it goes straight into the API.
        </h2>
        <div className="max-w-2xl">
          <ContactForm />
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-900/60 p-4 text-center transition hover:border-accent/30">
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="gradient-text mt-1 text-3xl font-extrabold">{value.toLocaleString()}</dd>
    </div>
  );
}
