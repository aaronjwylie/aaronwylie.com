import Link from 'next/link';
import { PrintButton } from '@/components/PrintButton';
import { LinkedInIcon } from '@/components/icons';

const LINKEDIN = 'https://www.linkedin.com/in/aaronwylie';

const EXPERIENCE = [
  {
    period: 'Present',
    role: 'Full-Stack Developer & Technical Founder',
    org: 'Independent · Remote worldwide',
    points: [
      'Build web and mobile apps, clean APIs, and the real-time and cloud infrastructure behind them for clients worldwide.',
      'Currently building a real-time live-streaming platform (WebRTC/WebSockets) shipping to iOS, Android and web with an admin portal.',
      'Design and ship documented REST APIs on Fastify/Node and Postgres, containerized with Docker and deployed with nginx, TLS and CI/CD.',
      'Hands-on observability and reliability with Dynatrace - distributed tracing, Kubernetes, and incident-style root-cause investigation.',
    ],
  },
  {
    period: '2014 - Present',
    role: 'Founder & Inventor',
    org: 'APPIX Technologies',
    points: [
      'Invented APPIX and built its first iterations, helping architect a distributed system across mobile apps, cloud infrastructure (DigitalOcean, AWS) and backend services.',
      'Delivered synchronized, real-time mobile experiences at live events for Disney, UFC, Red Bull, Universal, the Cleveland Cavaliers and the Hollywood Bowl - reaching over a million people.',
      'Led product strategy, technical coordination and production event operations in high-visibility, time-sensitive environments.',
      'Documented software specifications and aligned technical and business requirements across a cross-functional team.',
    ],
  },
  {
    period: '2003 - 2016',
    role: 'Founder & CEO',
    org: 'DigiCoyote Software',
    points: [
      'Founded and led a custom software development consultancy for 13 years.',
      'Led a distributed development team delivering tailored applications end to end for clients across many industries - owning architecture, delivery and quality assurance.',
      'Managed technical requirements, system performance and delivery timelines, translating business needs into scalable technical solutions.',
      'Ran client-facing consulting, solution planning and long-term partnerships.',
    ],
  },
];

const SKILLS: { label: string; items: string }[] = [
  { label: 'Languages', items: 'TypeScript, JavaScript, Python, PHP, Java, Kotlin, Objective-C, Swift, SQL' },
  { label: 'Frontend', items: 'React, React Native, Next.js, HTML, CSS, Tailwind CSS' },
  { label: 'Backend', items: 'Node.js, Fastify, Django, REST APIs, WebSockets, WebRTC' },
  { label: 'Data', items: 'PostgreSQL, MySQL, SQL Server, MongoDB, Redis' },
  { label: 'DevOps & Cloud', items: 'Docker, Kubernetes, nginx, CI/CD, AWS, DigitalOcean, Hetzner, Linux' },
  { label: 'Observability', items: 'Dynatrace, distributed tracing, metrics, incident investigation' },
];

const CLIENTS =
  'Disney · UFC · Red Bull · Universal · NBC · NBA · Cleveland Cavaliers · Hollywood Bowl · Tokyo 2020 · Shaw · Insomniac · Herbalife';

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-ink-950 py-10">
      {/* Toolbar (hidden when printing) */}
      <div className="no-print container-page mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-slate-400 hover:text-accent">
          ← Back to site
        </Link>
        <PrintButton />
      </div>

      {/* The résumé sheet — light, so it prints cleanly */}
      <article className="mx-auto max-w-3xl bg-white px-10 py-10 text-slate-800 shadow-2xl sm:rounded-lg print:shadow-none">
        <header className="flex items-center gap-6 border-b-2 border-slate-800 pb-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/headshot.jpg"
            alt="Aaron Wylie"
            width={96}
            height={96}
            className="h-24 w-24 shrink-0 rounded-full object-cover object-top ring-2 ring-slate-200"
          />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Aaron Wylie</h1>
            <p className="text-lg font-medium text-sky-700">
              Full-Stack Developer &amp; Technical Founder
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
              <span>Vancouver, Canada · Remote worldwide</span>
              <span className="text-slate-300">|</span>
              <a href="mailto:aaronwyliework@gmail.com" className="hover:text-sky-700 hover:underline">
                aaronwyliework@gmail.com
              </a>
              <span className="text-slate-300">|</span>
              <a href="https://aaronwylie.com" className="hover:text-sky-700 hover:underline">
                aaronwylie.com
              </a>
              <a
                href={LINKEDIN}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-[#0A66C2] hover:underline"
                aria-label="LinkedIn profile"
              >
                <LinkedInIcon className="h-4 w-4" /> LinkedIn
              </a>
            </div>
          </div>
        </header>

        <section className="mt-5">
          <p className="text-sm leading-relaxed text-slate-700">
            Full-stack developer and technical founder with 20+ years building software - from a
            13-year custom development consultancy to inventing and shipping APPIX, a live-experience
            platform used by Disney, UFC and Red Bull and seen by over a million people. I build web
            and mobile apps, clean APIs, and the real-time and cloud infrastructure behind them, with
            a strong side in observability and system reliability. I work remotely with clients
            worldwide and care about shipping software that is fast, maintainable and genuinely
            useful.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-900">Experience</h2>
          <div className="space-y-4">
            {EXPERIENCE.map((e) => (
              <div key={e.role}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-bold text-slate-900">
                    {e.role} <span className="font-normal text-slate-600">· {e.org}</span>
                  </h3>
                  <span className="whitespace-nowrap text-xs font-medium text-slate-500">{e.period}</span>
                </div>
                <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {e.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-900">
            Selected Clients
          </h2>
          <p className="text-sm text-slate-700">{CLIENTS}</p>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-900">Skills &amp; Technologies</h2>
          <dl className="space-y-1.5 text-sm">
            {SKILLS.map((s) => (
              <div key={s.label} className="flex gap-2">
                <dt className="w-36 shrink-0 font-semibold text-slate-900">{s.label}</dt>
                <dd className="text-slate-700">{s.items}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-900">Education</h2>
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">BCIT</span> - Software Systems
              Development (2000-2003)
              <br />
              <span className="font-semibold text-slate-900">CDIS</span> - Web Programming Track
              (1999-2000)
            </p>
          </div>
          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-900">Languages</h2>
            <p className="text-sm text-slate-700">English (fluent) · Spanish (basic)</p>
          </div>
        </section>
      </article>
    </div>
  );
}
