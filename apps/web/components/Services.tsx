import type { SVGProps } from 'react';
import {
  CodeIcon,
  ServerIcon,
  ZapIcon,
  TerminalIcon,
  ActivityIcon,
  StarIcon,
} from './icons';

type Service = {
  title: string;
  desc: string;
  Icon: (p: SVGProps<SVGSVGElement>) => JSX.Element;
  gradient: string;
};

const SERVICES: Service[] = [
  {
    title: 'Full-Stack Web & App Development',
    desc: 'End-to-end products - React, React Native and Next.js front ends on Node.js, Fastify or Django back ends. From idea to shipped.',
    Icon: CodeIcon,
    gradient: 'from-cyan-500 to-sky-600',
  },
  {
    title: 'APIs & Backend Systems',
    desc: 'Clean, documented REST APIs, solid data models, and third-party integrations - built to be reliable, secure and easy to build on.',
    Icon: ServerIcon,
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Real-Time Systems',
    desc: 'Low-latency, live experiences - WebRTC/WebSockets streaming, synchronized mobile content and real-time data at scale.',
    Icon: ZapIcon,
    gradient: 'from-fuchsia-500 to-purple-600',
  },
  {
    title: 'DevOps & Cloud Deployment',
    desc: 'Docker, Kubernetes, CI/CD and cloud (AWS, DigitalOcean, Hetzner) - get your app to production with TLS, monitoring and a repeatable pipeline.',
    Icon: TerminalIcon,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Observability & Reliability',
    desc: 'Instrumentation, distributed tracing and incident investigation (Dynatrace, metrics, health checks) to find root causes and keep systems healthy.',
    Icon: ActivityIcon,
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    title: 'Product & Technical Leadership',
    desc: 'Two decades of taking products from prototype to launch - technical direction, architecture, and translating business goals into working software.',
    Icon: StarIcon,
    gradient: 'from-indigo-500 to-violet-600',
  },
];

export function Services() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((s) => (
        <div key={s.title} className="card">
          <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient}`}>
            <s.Icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-white">{s.title}</h3>
          <p className="text-sm leading-relaxed text-slate-400">{s.desc}</p>
        </div>
      ))}
    </div>
  );
}
