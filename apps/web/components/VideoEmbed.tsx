/**
 * Responsive 16:9 Vimeo embed. Server-rendered (just an iframe), lazy-loaded so
 * it never blocks the page. `dnt=1` asks Vimeo not to track the visitor.
 */
export function VideoEmbed({ vimeoId, title }: { vimeoId: string; title: string }) {
  const src = `https://player.vimeo.com/video/${vimeoId}?dnt=1&title=0&byline=0&portrait=0`;
  return (
    <figure className="overflow-hidden rounded-xl border border-white/10 bg-black">
      <div className="relative aspect-video">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <figcaption className="px-3 py-2 text-xs text-slate-400">{title}</figcaption>
    </figure>
  );
}
