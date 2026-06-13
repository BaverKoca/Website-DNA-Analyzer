import Image from "next/image";
import type { FrequencyToken, WebsiteAnalysis } from "@/types/analysis";
import { ExportReportButton } from "@/components/export-report-button";
import { MetricBlock } from "@/components/metric-block";
import { PaletteStrip } from "@/components/palette-strip";

type AnalysisResultsProps = {
  analysis: WebsiteAnalysis | null;
  error?: string | null;
  isLoading: boolean;
  onRetry?: () => void;
  progressStage?: string;
};

const emptyItems = ["Type", "Color", "Spacing", "Visual", "Culture", "Report"];

export function AnalysisResults({
  analysis,
  error = null,
  isLoading,
  onRetry,
  progressStage = "Connecting",
}: AnalysisResultsProps) {
  if (!analysis) {
    return (
      <section className="flex min-h-[640px] flex-col justify-between overflow-hidden p-5 transition-opacity duration-500 sm:p-8 lg:p-10">
        <div>
          <div className="border border-line bg-white/[0.025] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ember">
              Audit output
            </p>
            <h2 className="mt-5 max-w-2xl text-4xl leading-none text-bone">
              A structured report will assemble here as soon as analysis completes.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-fog">
              Expect culture scores, Visual DNA screenshots, brand maturity, extracted design tokens,
              and a PDF-ready audit document generated from deterministic signals.
            </p>
          </div>
          {isLoading ? <ProgressPanel stage={progressStage} /> : null}
          {error ? <ErrorPanel error={error} onRetry={onRetry} /> : null}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {emptyItems.map((item) => (
              <div key={item} className="border border-line bg-white/[0.025] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-fog">
                  {item}
                </p>
                <div className="mt-12 h-px w-full bg-line" />
              </div>
            ))}
          </div>
        </div>
        <div className="border border-line p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-ember">
            {isLoading ? "Opening site with Playwright" : "Awaiting signal"}
          </p>
          <p className="mt-4 max-w-lg text-2xl leading-tight text-bone">
            {isLoading
              ? "The API route is extracting computed styles from visible elements."
              : "Submit a website to generate the first design DNA dashboard."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-[fadeIn_420ms_ease-out] overflow-hidden p-5 sm:p-8 lg:p-10">
      <AuditSummary analysis={analysis} />

      <DesignDnaMatch analysis={analysis} />

      <VisualDna analysis={analysis} />

      <DnaReport analysis={analysis} />

      <SectionHeader
        eyebrow="Extracted systems"
        title="Token systems"
        body="Top recurring values are shown first; dense raw values are grouped to keep the audit readable."
      />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <MetricBlock label="Typography system" value={analysis.typography.dominantFont}>
          <FrequencyList tokens={analysis.typography.fontFamilies} />
          <TokenList label="Sizes" tokens={analysis.typography.fontSizes} />
          <TokenList label="Weights" tokens={analysis.typography.fontWeights} />
        </MetricBlock>

        <MetricBlock label="Color palette" value={analysis.colors.dominantColor}>
          <PaletteStrip colors={analysis.colors.palette.map((color) => color.value)} />
          <FrequencyList tokens={analysis.colors.palette} />
        </MetricBlock>

        <MetricBlock label="Spacing scale" value={analysis.spacing.rhythm}>
          <TokenList tokens={analysis.spacing.values} />
        </MetricBlock>

        <MetricBlock label="Radius scale" value={analysis.radii.values[0]?.value ?? "none"}>
          <TokenList tokens={analysis.radii.values} />
        </MetricBlock>

        <MetricBlock
          label="Shadow scale"
          value={
            analysis.shadows.values.length === 1
              ? "1 shadow token"
              : `${analysis.shadows.values.length} shadow tokens`
          }
        >
          <FrequencyList tokens={analysis.shadows.values} emptyLabel="No visible shadows detected" />
        </MetricBlock>

        <MetricBlock label="Motion profile" value={analysis.motion.intensity}>
          <TokenList label="Transitions" tokens={analysis.motion.transitions} />
          <TokenList label="Animations" tokens={analysis.motion.animations} />
          <div className="mt-5 border-t border-line pt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
            {analysis.motion.hasMotion ? "motion detected" : "no motion detected"}
          </div>
        </MetricBlock>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border border-line bg-white/[0.025] p-5 sm:grid-cols-4">
        <MetaItem label="Elements" value={String(analysis.metadata.totalAnalyzedElements)} />
        <MetaItem label="Density" value={analysis.metadata.componentDensity} />
        <MetaItem
          label="Confidence"
          value={`${analysis.metadata.analysisConfidence.score}/100 ${analysis.metadata.analysisConfidence.level}`}
        />
        <MetaItem label="Node limit" value={String(analysis.metadata.nodeLimit)} />
        <MetaItem label="Dominant font" value={analysis.metadata.dominantFont} />
        <MetaItem label="Duration" value={`${analysis.metadata.durationMs}ms`} />
      </div>
    </section>
  );
}

function AuditSummary({ analysis }: { analysis: WebsiteAnalysis }) {
  return (
    <section className="overflow-hidden border border-line bg-black/20">
      <div className="grid gap-px bg-line lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0 bg-ink/95 p-5">
          <div className="flex flex-col justify-between gap-5 sm:flex-row">
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-fog">
                Analysis summary
              </p>
              <h2 className="mt-3 break-words text-2xl leading-tight text-bone sm:text-3xl" title={analysis.url}>
                {analysis.url}
              </h2>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
                {new Intl.DateTimeFormat("en", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(analysis.analyzedAt))}
              </p>
            </div>
            <div className="shrink-0">
              <ExportReportButton analysis={analysis} />
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <SummaryMetric label="Dominant culture" value={analysis.culture.dominantCulture} />
            <SummaryMetric label="Brand maturity" value={`${analysis.report.brandMaturity.score}/100`} />
            <SummaryMetric
              label="Analysis confidence"
              value={`${analysis.metadata.analysisConfidence.score}/100`}
              detail={analysis.metadata.analysisConfidence.level}
            />
          </div>
        </div>
        <div className="bg-ink/95 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-fog">Duration</p>
          <p className="mt-3 text-4xl leading-none text-bone">{analysis.metadata.durationMs}ms</p>
          <p className="mt-3 text-sm leading-6 text-fog">
            {analysis.metadata.totalAnalyzedElements} elements analyzed from{" "}
            {analysis.metadata.totalVisibleElements} visible candidates.
          </p>
        </div>
      </div>
    </section>
  );
}

function SummaryMetric({ detail, label, value }: { detail?: string; label: string; value: string }) {
  return (
    <div className="min-w-0 border border-line bg-white/[0.025] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-fog">{label}</p>
      <p className="mt-3 truncate text-2xl leading-none text-bone" title={value}>
        {value}
      </p>
      {detail ? (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ember">{detail}</p>
      ) : null}
    </div>
  );
}

function SectionHeader({ body, eyebrow, title }: { body: string; eyebrow: string; title: string }) {
  return (
    <div className="mt-6 border-t border-line pt-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ember">{eyebrow}</p>
      <div className="mt-3 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <h3 className="text-3xl leading-none text-bone">{title}</h3>
        <p className="max-w-xl text-sm leading-6 text-fog">{body}</p>
      </div>
    </div>
  );
}

function ProgressPanel({ stage }: { stage: string }) {
  return (
    <div className="mt-4 border border-line bg-black/20 p-5" aria-live="polite" role="status">
      <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-ember">Analysis in progress</p>
      <p className="mt-3 text-2xl leading-tight text-bone">{stage}</p>
      <div className="mt-4 h-1 overflow-hidden bg-white/[0.06]">
        <div className="h-full w-2/3 animate-[scan_1.8s_ease-in-out_infinite] bg-bone" />
      </div>
    </div>
  );
}

function ErrorPanel({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <div className="mt-4 border border-ember/40 bg-ember/[0.06] p-5" role="alert">
      <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-ember">Analysis interrupted</p>
      <p className="mt-3 text-sm leading-6 text-fog">{error}</p>
      {onRetry ? (
        <button
          className="mt-4 border border-bone/30 bg-bone px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-ember focus:ring-offset-2 focus:ring-offset-ink"
          onClick={onRetry}
          type="button"
        >
          Retry Analysis
        </button>
      ) : null}
    </div>
  );
}

function VisualDna({ analysis }: { analysis: WebsiteAnalysis }) {
  const scoreItems = [
    ["Visual Balance", analysis.visual.scores.visualBalance],
    ["Clarity", analysis.visual.scores.clarity],
    ["Visual Aggression", analysis.visual.scores.visualAggression],
    ["Minimalism", analysis.visual.scores.minimalism],
  ] as const;
  const metricItems = [
    ["Whitespace", analysis.visual.desktop.metrics.whitespaceDensity],
    ["Symmetry", analysis.visual.desktop.metrics.layoutSymmetry],
    ["Hierarchy", analysis.visual.desktop.metrics.visualHierarchy],
    ["CTA", analysis.visual.desktop.metrics.ctaProminence],
    ["Nav", analysis.visual.desktop.metrics.navigationComplexity],
    ["Contrast", analysis.visual.desktop.metrics.visualContrastDistribution],
  ] as const;

  return (
    <section className="mt-6 overflow-hidden border border-line bg-black/30 shadow-glow">
      <div className="border-b border-line p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ember">Visual DNA</p>
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <h3 className="max-w-3xl text-4xl leading-none text-bone sm:text-5xl">
              Screenshot-based layout intelligence.
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-fog">
              Deterministic visual heuristics from desktop and mobile captures: whitespace, rhythm,
              hierarchy, CTA presence, navigation load, and contrast distribution.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {scoreItems.map(([label, score]) => (
              <ScoreDial key={label} label={label} score={score} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-line xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 gap-px bg-line lg:grid-cols-[minmax(0,1fr)_220px]">
          <PreviewFrame
            alt="Desktop website screenshot"
            image={analysis.visual.desktop.screenshot}
            label="Desktop preview"
          />
          <PreviewFrame
            alt="Mobile website screenshot"
            image={analysis.visual.mobile.screenshot}
            label="Mobile preview"
            mobile
          />
        </div>

        <div className="bg-ink/95 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-fog">
            Visual metrics
          </p>
          <div className="mt-5 space-y-4">
            {metricItems.map(([label, score]) => (
              <MetricBar key={label} label={label} score={score} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-line lg:grid-cols-2">
        <ObservationPanel title="Hierarchy Analysis" items={analysis.visual.hierarchyAnalysis} />
        <ObservationPanel title="Layout Observations" items={analysis.visual.layoutObservations} />
      </div>
    </section>
  );
}

function PreviewFrame({
  alt,
  image,
  label,
  mobile = false,
}: {
  alt: string;
  image: string;
  label: string;
  mobile?: boolean;
}) {
  return (
    <figure className="min-w-0 bg-ink/95 p-4">
      <figcaption className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-fog">
        {label}
      </figcaption>
      <div
        className={
          mobile
            ? "mx-auto aspect-[9/19] w-full max-w-[180px] overflow-hidden border border-line bg-black shadow-glow"
            : "aspect-[16/10] w-full overflow-hidden border border-line bg-black shadow-glow"
        }
      >
        <Image
          alt={alt}
          className="block h-full w-full object-cover object-top"
          height={mobile ? 844 : 1100}
          src={image}
          unoptimized
          width={mobile ? 390 : 1440}
        />
      </div>
    </figure>
  );
}

function ScoreDial({ label, score }: { label: string; score: number }) {
  return (
    <div className="border border-line bg-white/[0.025] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">{label}</p>
      <p className="mt-3 text-4xl leading-none text-bone">{score}</p>
      <div className="mt-3 h-1 bg-white/[0.06]">
        <div className="h-full bg-ember" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function MetricBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-fog">{label}</span>
        <span className="font-mono text-[10px] text-ember">{score}/100</span>
      </div>
      <div className="h-1 bg-white/[0.06]">
        <div className="h-full bg-bone" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function ObservationPanel({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="bg-ink/95 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-fog">{title}</p>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <p className="border-t border-line pt-2 text-sm leading-6 text-fog" key={item}>
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function DnaReport({ analysis }: { analysis: WebsiteAnalysis }) {
  const maturity = analysis.report.brandMaturity;

  return (
    <section className="mt-6 border border-line bg-black/20">
      <div className="grid border-b border-line lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-ember">DNA Report</p>
          <h3 className="mt-4 max-w-3xl text-4xl leading-none text-bone sm:text-5xl">
            Premium audit report
          </h3>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-fog">
            A deterministic editorial read generated from extracted tokens, classifier scores, and
            system consistency signals.
          </p>
        </div>
        <div className="border-t border-line p-5 lg:border-l lg:border-t-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-fog">
            Brand maturity
          </p>
          <p className="mt-3 text-6xl leading-none text-bone">{maturity.score}</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ember">
            {maturity.level}
          </p>
        </div>
      </div>

      <div className="grid max-h-[720px] gap-px overflow-y-auto bg-line md:grid-cols-2">
        {analysis.report.sections.map((section) => (
          <article className="min-w-0 bg-ink/95 p-5" key={section.title}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-fog">
                  {section.title}
                </p>
                <p className="mt-3 text-xl leading-tight text-bone">{section.label}</p>
              </div>
              {section.title === "Brand Maturity Score" ? (
                <span className="border border-line px-3 py-1 font-mono text-[10px] text-ember">
                  {maturity.score}/100
                </span>
              ) : null}
            </div>
            <p className="mt-4 break-words text-sm leading-6 text-fog">{section.body}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {section.evidence.slice(0, 4).map((item) => (
                <span
                  className="max-w-full break-words border border-line bg-white/[0.025] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-fog"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-px bg-line sm:grid-cols-3 lg:grid-cols-6">
        {Object.entries(maturity.factors).map(([factor, score]) => (
          <div className="bg-ink/95 p-4" key={factor}>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
              {factor.replace(/([A-Z])/g, " $1")}
            </p>
            <div className="mt-3 h-1 bg-white/[0.06]">
              <div className="h-full bg-ember" style={{ width: `${score}%` }} />
            </div>
            <p className="mt-2 font-mono text-[10px] text-bone">{score}/100</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function DesignDnaMatch({ analysis }: { analysis: WebsiteAnalysis }) {
  const topScores = analysis.culture.scores.slice(0, 6);

  return (
    <section className="mt-6 overflow-hidden border border-line bg-white/[0.025] p-5">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.72fr)]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-ember">
            Design DNA match
          </p>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="max-w-2xl break-words text-4xl leading-[0.95] text-bone sm:text-5xl">
                {analysis.culture.dominantCulture}
              </h3>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-fog">
                {analysis.culture.confidence} confidence
              </p>
            </div>
            <div className="border border-line px-4 py-3 text-right">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-fog">Score</p>
              <p className="mt-1 text-3xl text-bone">{analysis.culture.scores[0]?.score ?? 0}%</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <EvidencePanel title="Dominant Culture Explanation" items={analysis.culture.explanation} />
            <EvidencePanel title="Strongest Detected Signals" items={analysis.culture.strongestSignals} />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-fog">
              Culture score bars
            </p>
            <div className="mt-4 space-y-3">
              {topScores.map((score) => (
                <div key={score.culture}>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-sm text-fog" title={score.culture}>
                      {score.culture}
                    </span>
                    <span className="font-mono text-[10px] text-ember">{score.score}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06]">
                    <div className="h-full bg-bone" style={{ width: `${score.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-line pt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-fog">
              Secondary influences
            </p>
            <div className="mt-3 space-y-2">
              {analysis.culture.secondaryInfluences.length > 0 ? (
                analysis.culture.secondaryInfluences.map((influence) => (
                  <div
                    className="flex items-center justify-between gap-4 border border-line px-3 py-2"
                    key={influence.culture}
                  >
                    <span className="min-w-0 truncate text-sm text-fog" title={influence.culture}>
                      {influence.culture}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ember">
                      {influence.score}%
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-fog">No strong secondary influence crossed the threshold.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EvidencePanel({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-fog">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <p className="border-t border-line pt-2 text-sm leading-6 text-fog" key={item}>
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function TokenList({ label, tokens }: { label?: string; tokens: FrequencyToken[] }) {
  if (tokens.length === 0) {
    return null;
  }

  const visibleTokens = tokens.slice(0, 10);
  const hiddenCount = Math.max(tokens.length - visibleTokens.length, 0);

  return (
    <div className="mt-5">
      {label ? (
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ember">{label}</p>
      ) : null}
      <div className="max-h-32 overflow-y-auto pr-1">
        <div className="flex flex-wrap gap-2">
        {visibleTokens.map((token) => (
          <span
            className="max-w-full truncate border border-line bg-white/[0.025] px-3 py-2 font-mono text-xs text-fog"
            key={token.value}
            title={token.value}
          >
            {token.value}
          </span>
        ))}
        {hiddenCount > 0 ? (
          <span className="border border-line bg-white/[0.025] px-3 py-2 font-mono text-xs text-ember">
            + {hiddenCount} more
          </span>
        ) : null}
        </div>
      </div>
    </div>
  );
}

function FrequencyList({
  emptyLabel = "No repeated values detected",
  tokens,
}: {
  emptyLabel?: string;
  tokens: FrequencyToken[];
}) {
  if (tokens.length === 0) {
    return <p className="mt-5 border-t border-line pt-3 text-sm text-fog">{emptyLabel}</p>;
  }

  return (
    <div className="mt-5 space-y-2">
      {tokens.slice(0, 5).map((token) => (
        <div
          key={token.value}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-line pt-2"
        >
          <span className="truncate text-sm text-fog" title={token.value}>
            {token.value}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ember">
            {token.count} / {token.percentage}%
          </span>
        </div>
      ))}
      {tokens.length > 5 ? (
        <p className="border-t border-line pt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ember">
          + {tokens.length - 5} more values grouped
        </p>
      ) : null}
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-fog">{label}</p>
      <p className="mt-2 truncate text-sm text-bone" title={value}>
        {value}
      </p>
    </div>
  );
}
