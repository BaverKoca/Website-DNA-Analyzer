"use client";

import Image from "next/image";
import { buildComparisonVerdicts } from "@/lib/analysis/comparison";
import {
  createComparisonId,
  saveComparisonForReport,
} from "@/lib/analysis/session-report-store";
import type { WebsiteAnalysis } from "@/types/analysis";
import type { ComparisonSide, WebsiteComparison } from "@/types/comparison";

type CompareResultsProps = {
  left: WebsiteAnalysis;
  right: WebsiteAnalysis;
};

export function CompareResults({ left, right }: CompareResultsProps) {
  const verdicts = buildComparisonVerdicts(left, right);

  function handleExport() {
    const comparison: WebsiteComparison = {
      id: createComparisonId(left, right),
      createdAt: new Date().toISOString(),
      left,
      right,
      verdicts,
    };
    saveComparisonForReport(comparison);
    window.open(`/compare-report/${comparison.id}`, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="overflow-hidden p-5 sm:p-8 lg:p-10">
      <div className="flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-ember">Compare mode</p>
          <h2 className="mt-3 text-4xl leading-none text-bone">Side-by-side design audit.</h2>
        </div>
        <button
          className="border border-bone/30 bg-bone px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink transition hover:bg-white"
          onClick={handleExport}
          type="button"
        >
          Export Comparison
        </button>
      </div>

      <div className="mt-6 grid min-w-0 gap-4 xl:grid-cols-2">
        <ComparisonColumn analysis={left} side="left" verdicts={verdicts} />
        <ComparisonColumn analysis={right} side="right" verdicts={verdicts} />
      </div>

      <div className="mt-4 overflow-hidden border border-line bg-white/[0.025] p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-ember">Comparison verdict</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {verdicts.map((verdict) => (
            <div className="min-w-0 border border-line p-4" key={verdict.label}>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-fog">
                {verdict.label}
              </p>
              <p className="mt-3 truncate text-xl leading-tight text-bone" title={winnerLabel(verdict.winner, left, right)}>
                {winnerLabel(verdict.winner, left, right)}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-fog">{verdict.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonColumn({
  analysis,
  side,
  verdicts,
}: {
  analysis: WebsiteAnalysis;
  side: Exclude<ComparisonSide, "tie">;
  verdicts: ReturnType<typeof buildComparisonVerdicts>;
}) {
  const scoreRows = [
    ["Culture", `${analysis.culture.scores[0]?.score ?? 0}%`],
    ["Maturity", `${analysis.report.brandMaturity.score}/100`],
    ["Minimalism", `${analysis.visual.scores.minimalism}/100`],
    ["Hierarchy", `${analysis.visual.desktop.metrics.visualHierarchy}/100`],
    ["Clarity", `${analysis.visual.scores.clarity}/100`],
  ];
  const systemRows = [
    ["Typography", analysis.typography.dominantFont],
    ["Palette", analysis.colors.palette.slice(0, 5).map((token) => token.value).join(" ")],
    ["Spacing", analysis.spacing.rhythm],
    ["Radius", analysis.radii.values[0]?.value ?? "none"],
    ["Motion", analysis.motion.intensity],
  ];
  const wins = verdicts.filter((verdict) => verdict.winner === side).length;

  return (
    <article className="min-w-0 overflow-hidden border border-line bg-white/[0.025]">
      <div className="border-b border-line p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-fog">
              {side === "left" ? "Site A" : "Site B"}
            </p>
            <h3 className="mt-3 break-words text-2xl leading-tight text-bone" title={analysis.url}>
              {analysis.url}
            </h3>
          </div>
          <span className="shrink-0 border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ember">
            {wins} wins
          </span>
        </div>
        <p className="mt-4 break-words text-4xl leading-none text-bone">{analysis.culture.dominantCulture}</p>
      </div>

      <div className="grid min-w-0 gap-px bg-line md:grid-cols-2">
        <Screenshot image={analysis.visual.desktop.screenshot} label="Desktop" width={1440} height={1100} />
        <Screenshot image={analysis.visual.mobile.screenshot} label="Mobile" width={390} height={844} mobile />
      </div>

      <div className="grid min-w-0 gap-px bg-line md:grid-cols-2">
        <DataPanel title="Scores" rows={scoreRows} />
        <DataPanel title="Systems" rows={systemRows} />
      </div>
    </article>
  );
}

function Screenshot({
  height,
  image,
  label,
  mobile = false,
  width,
}: {
  height: number;
  image: string;
  label: string;
  mobile?: boolean;
  width: number;
}) {
  return (
    <figure className="min-w-0 bg-ink/95 p-4">
      <figcaption className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fog">
        {label}
      </figcaption>
      <div
        className={
          mobile
            ? "mx-auto aspect-[9/19] w-full max-w-28 overflow-hidden border border-line"
            : "aspect-[16/10] w-full overflow-hidden border border-line"
        }
      >
        <Image
          alt={`${label} screenshot`}
          className="h-full w-full object-cover object-top"
          height={height}
          src={image}
          unoptimized
          width={width}
        />
      </div>
    </figure>
  );
}

function DataPanel({ rows, title }: { rows: string[][]; title: string }) {
  return (
    <div className="min-w-0 bg-ink/95 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-fog">{title}</p>
      <div className="mt-4 space-y-2">
        {rows.map(([label, value]) => (
          <div className="grid min-w-0 grid-cols-[90px_minmax(0,1fr)] gap-3 border-t border-line pt-2 sm:grid-cols-[110px_minmax(0,1fr)]" key={label}>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ember">{label}</span>
            <span className="truncate text-sm text-fog" title={value}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function winnerLabel(winner: ComparisonSide, left: WebsiteAnalysis, right: WebsiteAnalysis) {
  if (winner === "tie") {
    return "Effectively tied";
  }
  return winner === "left" ? host(left.url) : host(right.url);
}

function host(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
