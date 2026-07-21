import type { SVGProps } from 'react';
import Link from 'next/link';
import type { Project } from '@/lib/api';
import { apiUrl } from '@/lib/api';
import { CASE_STUDY_SLUGS } from '@/lib/caseStudies';
import { VideoEmbed } from './VideoEmbed';
import { BroadcastIcon, ServerIcon, VideoIcon, ActivityIcon, LayersIcon } from './icons';

// A distinct gradient + icon per project so the grid reads as covers, not text blocks.
type CardStyle = { gradient: string; Icon: (p: SVGProps<SVGSVGElement>) => JSX.Element };
const PROJECT_STYLE: Record<string, CardStyle> = {
  appix: { gradient: 'from-cyan-500 via-sky-500 to-violet-600', Icon: BroadcastIcon },
  'portfolio-api': { gradient: 'from-emerald-500 to-teal-600', Icon: ServerIcon },
  'live-streaming-platform': { gradient: 'from-fuchsia-500 via-pink-500 to-rose-600', Icon: VideoIcon },
  'dynatrace-observability-lab': { gradient: 'from-amber-500 to-orange-600', Icon: ActivityIcon },
};
const DEFAULT_STYLE: CardStyle = { gradient: 'from-slate-500 to-slate-700', Icon: LayersIcon };

function linkHref(project: Project, key: string, value: unknown): string {
  const str = String(value);
  // Relative API links (docs/health/metrics) resolve against the API origin.
  if (str.startsWith('/')) return `${apiUrl}${str}`;
  return str;
}

const LINK_LABELS: Record<string, string> = {
  appStore: 'App Store',
  playStore: 'Google Play',
  website: 'Website',
  live: 'Live',
  github: 'GitHub',
  docs: 'API Docs',
  health: 'Health',
  metrics: 'Metrics',
};

export function ProjectCard({ project }: { project: Project }) {
  const { links } = project;
  const simpleLinks = Object.entries(links).filter(
    ([k, v]) => k !== 'press' && typeof v === 'string',
  );
  const press = Array.isArray(links.press) ? links.press : [];
  const videos = Array.isArray(links.videos) ? links.videos : [];
  const { gradient, Icon } = PROJECT_STYLE[project.slug] ?? DEFAULT_STYLE;
  const hasCaseStudy = CASE_STUDY_SLUGS.has(project.slug);

  return (
    <article className={`card ${project.featured ? 'ring-1 ring-accent/30' : ''}`}>
      {/* Generative gradient cover with the project's icon */}
      <div className={`relative -mx-6 -mt-6 mb-5 h-24 overflow-hidden rounded-t-2xl bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_100%_0%,rgba(255,255,255,0.28),transparent_55%)]" />
        <Icon className="pointer-events-none absolute -right-3 -top-3 h-28 w-28 text-white/25" />
        <div className="absolute bottom-3 left-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">{project.title}</h3>
            {project.featured && (
              <span className="chip border-accent/40 text-accent">Flagship</span>
            )}
          </div>
          {project.role && <p className="mt-1 text-sm text-slate-400">{project.role}</p>}
        </div>
      </div>

      <p className="mb-3 font-medium text-slate-200">{project.tagline}</p>
      <p className="mb-4 text-sm leading-relaxed text-slate-400">{project.description}</p>

      {videos.length > 0 && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {videos.map((v) => (
            <VideoEmbed key={v.vimeoId} vimeoId={v.vimeoId} title={v.title} />
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {project.techStack.map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {hasCaseStudy && (
          <Link href={`/projects/${project.slug}`} className="btn-primary">
            Read case study →
          </Link>
        )}
        {simpleLinks.map(([key, value]) => (
          <a
            key={key}
            href={linkHref(project, key, value)}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
          >
            {LINK_LABELS[key] ?? key} ↗
          </a>
        ))}
      </div>

      {press.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="section-label mb-2">In the press</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {press.map((p) => (
              <li key={p.url}>
                <a href={p.url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                  {p.outlet} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
