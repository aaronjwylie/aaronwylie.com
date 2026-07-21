import type { Project } from '@/lib/api';
import { apiUrl } from '@/lib/api';
import { VideoEmbed } from './VideoEmbed';

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

  return (
    <article className={`card ${project.featured ? 'ring-1 ring-accent/30' : ''}`}>
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
