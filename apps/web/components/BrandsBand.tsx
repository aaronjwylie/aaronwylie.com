// Real brands whose live events APPIX has powered. Presented as clean text
// (not lifted logos) — cohesive with the site and honest about the relationship.
const BRANDS = [
  'Disney',
  'Universal',
  'UFC',
  'Red Bull',
  'NBC',
  'NBA',
  'Cleveland Cavaliers',
  'Hollywood Bowl',
  'Tokyo 2020',
  'Katy Perry',
  'New Kids on the Block',
  'Shaw',
  'Insomniac',
];

export function BrandsBand() {
  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/40 p-6 sm:p-8">
      <p className="section-label mb-5 text-center">Brands reached through APPIX</p>
      <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
        {BRANDS.map((b) => (
          <span
            key={b}
            className="text-base font-semibold text-slate-300/90 transition hover:text-white sm:text-lg"
          >
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}
