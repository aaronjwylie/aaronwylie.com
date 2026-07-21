const STATS: { value: string; label: string }[] = [
  { value: '20+', label: 'Years building software' },
  { value: '2', label: 'Companies founded' },
  { value: '1M+', label: 'People reached (APPIX)' },
  { value: '15+', label: 'World-class brands served' },
];

export function ByTheNumbers() {
  return (
    <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {STATS.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-white/10 bg-ink-900/50 p-5 text-center transition hover:border-accent/30"
        >
          <dt className="gradient-text text-4xl font-extrabold">{s.value}</dt>
          <dd className="mt-1 text-xs uppercase tracking-wide text-slate-400">{s.label}</dd>
        </div>
      ))}
    </dl>
  );
}
