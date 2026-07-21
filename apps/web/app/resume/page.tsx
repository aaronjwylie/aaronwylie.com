import Link from 'next/link';
import { PrintButton } from '@/components/PrintButton';

const EXPERIENCE = [
  {
    period: 'Present',
    role: 'Full-Stack Developer & Technical Founder',
    org: 'Independent · Remote worldwide',
    points: [
      'Build web and mobile apps, clean APIs, and the real-time and cloud infrastructure behind them for clients worldwide.',
      'Currently building a real-time live-streaming platform (WebRTC/WebSockets) shipping to iOS, Android and web with an admin portal.',
      'Hands-on observability and reliability with Dynatrace - distributed tracing, Kubernetes, and incident investigation.',
    ],
  },
  {
    period: '2014 - Present',
    role: 'Founder & Inventor',
    org: 'APPIX Technologies',
    points: [
      'Invented APPIX and built its first iterations, helping architect a distributed system across mobile apps, cloud infrastructure (DigitalOcean, AWS) and backend services.',
      'Delivered synchronized, real-time mobile experiences at live events for Disney, UFC, Red Bull, Universal, the Cleveland Cavaliers and the Hollywood Bowl.',
      'Led product strategy, technical coordination and production event operations in high-visibility, time-sensitive environments.',
    ],
  },
  {
    period: '2003 - 2016',
    role: 'Founder & CEO',
    org: 'DigiCoyote Software',
    points: [
      'Founded and led a custom software development consultancy for 13 years.',
      'Led a distributed development team delivering tailored applications end to end for clients across many industries - owning architecture, delivery and quality assurance.',
      'Translated business needs into scalable technical solutions and supported production software environments.',
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
        <header className="border-b-2 border-slate-800 pb-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Aaron Wylie</h1>
          <p className="text-lg font-medium text-sky-700">Full-Stack Developer &amp; Technical Founder</p>
          <p className="mt-2 text-sm text-slate-600">
            Vancouver, Canada · Remote worldwide · aaronwyliework@gmail.com ·{' '}
            linkedin.com/in/aaronwylie · aaronwylie.com
          </p>
        </header>

        <section className="mt-5">
          <p className="text-sm leading-relaxed text-slate-700">
            Full-stack developer and technical founder with 20+ years building software - from a
            13-year custom development consultancy to inventing and shipping APPIX, a live-experience
            platform used by Disney, UFC and Red Bull. I build web and mobile apps, clean APIs, and
            the real-time and cloud infrastructure behind them, with a strong side in observability
            and system reliability.
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

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-900">Education</h2>
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">BCIT</span> - Software Systems Development
            (2000-2003) · <span className="font-semibold text-slate-900">CDIS</span> - Web
            Programming Track (1999-2000)
          </p>
        </section>
      </article>
    </div>
  );
}
