import Link from 'next/link';
import { getProjects, getStats, apiUrl } from '@/lib/api';
import { ProjectCard } from '@/components/ProjectCard';
import { ContactForm } from '@/components/ContactForm';

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
      <section className="container-page pt-20 pb-16">
        <div className="flex flex-col-reverse items-start gap-10 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <p className="section-label mb-4">Backend &amp; Full-Stack Engineer</p>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-6xl">
              I build backends that ship - and this site runs on one of them.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-400">
              I&apos;m a backend engineer who cares about clean APIs, reliable data models and real
              infrastructure. The projects, stats and contact form below are all served by an API I
              built in TypeScript &amp; Postgres - you can{' '}
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/headshot.jpg"
              alt="Aaron Wylie"
              width={288}
              height={288}
              className="h-44 w-44 rounded-full object-cover object-top shadow-2xl ring-4 ring-accent/30 sm:h-56 sm:w-56 md:h-72 md:w-72"
            />
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
      </section>

      {/* ---------- Flagship ---------- */}
      {flagship && (
        <section className="container-page py-10">
          <p className="section-label mb-4">Flagship project</p>
          <ProjectCard project={flagship} />
        </section>
      )}

      {/* ---------- Other projects ---------- */}
      <section id="projects" className="container-page py-10 scroll-mt-20">
        <p className="section-label mb-4">More projects</p>
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

      {/* ---------- Contact ---------- */}
      <section id="contact" className="container-page py-16 scroll-mt-20">
        <p className="section-label mb-4">Get in touch</p>
        <h2 className="mb-6 max-w-xl text-2xl font-bold text-white">
          Hiring for a backend or full-stack role? Send a message - it goes straight into the API.
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
    <div className="rounded-xl border border-white/10 bg-ink-900/60 p-4 text-center">
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-2xl font-bold text-white">{value.toLocaleString()}</dd>
    </div>
  );
}
