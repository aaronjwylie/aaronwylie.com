import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'FAQ - Working with Aaron Wylie',
  description:
    'Answers to common questions about working with Aaron Wylie - availability, remote work and time zones, project types, tech stack and how engagements run.',
  alternates: { canonical: '/faq' },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Are you available for freelance and full-time work?',
    a: 'Yes - both. I take on freelance and contract projects, and I am open to the right full-time role. I work remotely with clients worldwide from Vancouver, Canada.',
  },
  {
    q: 'Where are you based, and do time zones matter?',
    a: "I'm based in Vancouver, Canada (Pacific Time), and I work with clients across the world. Pacific Time overlaps well with the Americas and has a workable window with Europe and Asia-Pacific; I keep flexible hours and I'm used to async collaboration, so time zones are rarely a blocker.",
  },
  {
    q: 'What kinds of projects do you take on?',
    a: 'Full-stack web and mobile apps, backend and API development, real-time systems (WebRTC/WebSockets), DevOps and cloud deployment, observability and reliability work, and modernizing older sites - including migrations off WordPress. If it involves building or shipping software, it is probably in scope.',
  },
  {
    q: 'What is your tech stack?',
    a: 'Day to day: TypeScript across React / React Native / Next.js on the front end and Node.js / Fastify on the back end, with PostgreSQL, Docker, nginx and CI/CD. I also work with Python, Kubernetes, AWS/DigitalOcean, and observability tooling like Dynatrace. I pick up new stacks quickly when a project calls for it.',
  },
  {
    q: 'Can you take a project from idea to production?',
    a: 'Yes - that is my favourite kind of work. I have built and shipped products end to end as a founder and for clients, from prototype through architecture, delivery, deployment with HTTPS and monitoring, and ongoing support. This very site is an example: it runs on infrastructure and an API I built and deployed myself.',
  },
  {
    q: 'How do engagements usually work?',
    a: "We start with a short conversation about your goals, constraints and timeline. From there I scope the work, agree on milestones, and ship in visible increments so you always know where things stand. I value clear communication and I'd rather over-communicate than leave you guessing.",
  },
  {
    q: 'Do you help move sites off WordPress?',
    a: 'Yes. I have plenty of WordPress experience and I have also rebuilt sites onto modern stacks. I approach migrations carefully - preserving URLs and SEO, moving incrementally rather than all at once, and keeping a good editing experience for content owners.',
  },
  {
    q: 'How do I get in touch?',
    a: 'The quickest way is the contact form on the home page - it goes straight into my inbox. Tell me a bit about your project or role and I will get back to you.',
  },
];

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="container-page py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <p className="section-label mb-4">FAQ</p>
      <h1 className="mb-3 text-4xl font-extrabold text-white">Working together</h1>
      <p className="mb-10 max-w-2xl text-lg text-slate-400">
        Common questions about availability, how I work, and what I can help with. Don&apos;t see
        yours? <a href="/#contact" className="text-accent hover:underline">Just ask</a>.
      </p>

      <div className="space-y-4">
        {FAQS.map((f) => (
          <details key={f.q} className="card">
            <summary className="cursor-pointer text-lg font-bold text-white">{f.q}</summary>
            <p className="mt-3 leading-relaxed text-slate-400">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-12 border-t border-white/10 pt-6">
        <Link href="/#contact" className="btn-primary">
          Get in touch
        </Link>
      </div>
    </div>
  );
}
