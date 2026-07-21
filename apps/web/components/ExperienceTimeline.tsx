type Entry = {
  period: string;
  role: string;
  org: string;
  detail: string;
};

const ENTRIES: Entry[] = [
  {
    period: 'Present',
    role: 'Full-Stack Developer & Technical Founder',
    org: 'Independent · Remote worldwide',
    detail:
      'Building web and mobile apps, APIs, and the real-time and cloud infrastructure behind them for clients worldwide - currently building a real-time live-streaming platform, with a strong side in observability and system reliability (Dynatrace).',
  },
  {
    period: '2014 - Present',
    role: 'Founder & Inventor',
    org: 'APPIX Technologies',
    detail:
      'Invented APPIX and built its first iterations, architecting a distributed system across mobile apps, cloud infrastructure (DigitalOcean, AWS) and backend services. Grew it into a live-experience platform used by Disney, UFC, Red Bull, Universal, the Cleveland Cavaliers and the Hollywood Bowl.',
  },
  {
    period: '2003 - 2016',
    role: 'Founder & CEO',
    org: 'DigiCoyote Software',
    detail:
      'Founded and led a custom software development consultancy for 13 years - leading a distributed development team delivering tailored applications end to end for clients across many industries, from requirements and architecture through delivery and quality assurance.',
  },
  {
    period: '2000 - 2003',
    role: 'Software Systems Development',
    org: 'BCIT',
    detail: 'Formal software education, following a Web Programming track at CDIS (1999-2000).',
  },
];

export function ExperienceTimeline() {
  return (
    <ol className="relative ml-3 space-y-8 border-l border-white/10 pl-8">
      {ENTRIES.map((e) => (
        <li key={e.role} className="relative">
          <span className="absolute -left-[41px] top-1.5 h-3.5 w-3.5 rounded-full bg-gradient-to-br from-accent-cyan to-accent-violet ring-4 ring-ink-950" />
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-cyan">{e.period}</p>
          <h3 className="mt-1 text-lg font-bold text-white">{e.role}</h3>
          <p className="text-sm font-medium text-slate-300">{e.org}</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{e.detail}</p>
        </li>
      ))}
    </ol>
  );
}
