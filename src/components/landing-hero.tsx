const positioningCards = [
  {
    title: "Design Culture Fingerprint",
    body: "Rules-based classification maps a site against modern product, editorial, luxury, startup, and developer cultures.",
    metric: "10 profiles",
  },
  {
    title: "Visual DNA Metrics",
    body: "Screenshot heuristics score hierarchy, minimalism, balance, density, contrast, CTA prominence, and mobile behavior.",
    metric: "2 viewports",
  },
  {
    title: "Exportable Audit Reports",
    body: "Session reports turn extracted systems into a polished consulting-style document ready for browser PDF export.",
    metric: "PDF-ready",
  },
];

const previewRows = [
  ["Culture", "Linear / Product-led SaaS", "84%"],
  ["Visual Balance", "Symmetry + rhythm", "76"],
  ["Brand Maturity", "System consistency", "82"],
];

export function LandingHero() {
  return (
    <section className="mx-auto grid w-full max-w-[1600px] gap-5 pb-5 lg:grid-cols-[minmax(0,1fr)_440px]">
      <div className="border border-line bg-ink/65 p-5 shadow-glow backdrop-blur sm:p-8 lg:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-ember">
          Elite deterministic website audits
        </p>
        <h1 className="mt-7 max-w-5xl font-editorial text-6xl leading-[0.9] text-bone sm:text-7xl lg:text-8xl">
          Read the design system beneath the surface.
        </h1>
        <p className="mt-7 max-w-3xl text-xl leading-8 text-bone">
          Website DNA Analyzer reveals the design culture, visual system, and brand maturity behind
          any website.
        </p>
        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {positioningCards.map((card) => (
            <article className="min-h-44 border border-line bg-white/[0.025] p-4" key={card.title}>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember">
                {card.metric}
              </p>
              <h2 className="mt-5 text-xl leading-tight text-bone">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-fog">{card.body}</p>
            </article>
          ))}
        </div>
      </div>

      <aside className="border border-line bg-black/30 p-5 shadow-glow backdrop-blur sm:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-fog">Product preview</p>
        <div className="mt-5 border border-line bg-ink/95 p-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember">
              DNA Match
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog">
              Live sample
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {previewRows.map(([label, value, score]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between gap-3">
                  <span className="text-sm text-fog">{label}</span>
                  <span className="font-mono text-[10px] text-ember">{score}</span>
                </div>
                <p className="truncate text-xl leading-tight text-bone">{value}</p>
                <div className="mt-2 h-1 bg-white/[0.06]">
                  <div className="h-full bg-bone" style={{ width: score.includes("%") ? score : `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="border border-line bg-white/[0.025] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">Visual DNA</p>
            <p className="mt-8 text-3xl text-bone">92</p>
            <p className="mt-2 text-sm text-fog">Minimalism signal</p>
          </div>
          <div className="border border-line bg-white/[0.025] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">Report</p>
            <p className="mt-8 text-3xl text-bone">A4</p>
            <p className="mt-2 text-sm text-fog">Audit export</p>
          </div>
        </div>
      </aside>
    </section>
  );
}
