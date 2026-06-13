"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { loadComparisonForReport } from "@/lib/analysis/session-report-store";
import type { WebsiteAnalysis } from "@/types/analysis";
import type { WebsiteComparison } from "@/types/comparison";

export function CompareReportDocument({ comparisonId }: { comparisonId: string }) {
  const [comparison, setComparison] = useState<WebsiteComparison | null>(null);
  const [isMissing, setIsMissing] = useState(false);

  useEffect(() => {
    const storedComparison = loadComparisonForReport(comparisonId);
    setComparison(storedComparison);
    setIsMissing(!storedComparison);
  }, [comparisonId]);

  if (isMissing) {
    return (
      <main className="min-h-screen bg-[#f4f1ea] px-6 py-12 text-[#171512]">
        <div className="mx-auto max-w-3xl border border-[#171512]/20 bg-white p-10">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#8a6a2f]">Comparison unavailable</p>
          <h1 className="mt-5 text-5xl leading-none">This comparison is not in the current browser session.</h1>
        </div>
      </main>
    );
  }

  if (!comparison) {
    return <main className="min-h-screen bg-[#f4f1ea]" />;
  }

  return (
    <main className="min-h-screen bg-[#f4f1ea] px-4 py-6 text-[#171512] print:bg-white print:px-0 print:py-0">
      <article className="mx-auto max-w-6xl overflow-hidden bg-[#fbfaf6] shadow-2xl shadow-black/10 print:max-w-none print:shadow-none">
        <header className="border-b border-[#171512]/15 px-8 py-10 print:px-10">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#9b7632]">Website DNA Comparison</p>
          <h1 className="mt-5 max-w-5xl text-6xl leading-[0.92] tracking-[-0.02em] text-[#171512] md:text-7xl">
            Side-by-side premium audit.
          </h1>
          <p className="mt-5 text-sm text-[#5f5a52]">
            {host(comparison.left.url)} vs {host(comparison.right.url)}
          </p>
        </header>

        <section className="grid border-b border-[#171512]/15 lg:grid-cols-2">
          <SiteSummary analysis={comparison.left} label="Site A" />
          <SiteSummary analysis={comparison.right} label="Site B" />
        </section>

        <section className="border-b border-[#171512]/15 p-8 print:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#9b7632]">Consulting verdict</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {comparison.verdicts.map((verdict) => (
              <div className="min-w-0 border border-[#171512]/15 p-5" key={verdict.label}>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6f685f]">{verdict.label}</p>
                <h2 className="mt-3 truncate text-2xl leading-tight" title={winnerLabel(verdict.winner, comparison)}>
                  {winnerLabel(verdict.winner, comparison)}
                </h2>
                <p className="mt-3 break-words text-sm leading-6 text-[#5f5a52]">{verdict.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-px bg-[#171512]/15 lg:grid-cols-2">
          <ScreenshotSet analysis={comparison.left} />
          <ScreenshotSet analysis={comparison.right} />
        </section>
      </article>
    </main>
  );
}

function SiteSummary({ analysis, label }: { analysis: WebsiteAnalysis; label: string }) {
  const rows = [
    ["Culture", analysis.culture.dominantCulture],
    ["Culture score", `${analysis.culture.scores[0]?.score ?? 0}%`],
    ["Brand maturity", `${analysis.report.brandMaturity.score}/100`],
    ["Typography", analysis.typography.dominantFont],
    ["Palette", analysis.colors.palette.slice(0, 4).map((token) => token.value).join(" ")],
    ["Spacing", analysis.spacing.rhythm],
    ["Radius", analysis.radii.values[0]?.value ?? "none"],
    ["Motion", analysis.motion.intensity],
  ];

  return (
    <div className="min-w-0 border-b border-[#171512]/15 p-8 lg:border-b-0 lg:border-r print:p-10">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#9b7632]">{label}</p>
      <h2 className="mt-4 break-words text-3xl leading-tight" title={analysis.url}>{analysis.url}</h2>
      <div className="mt-6 space-y-3">
        {rows.map(([rowLabel, value]) => (
          <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-4 border-t border-[#171512]/15 pt-3" key={rowLabel}>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#6f685f]">{rowLabel}</span>
            <span className="min-w-0 truncate text-sm" title={value}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenshotSet({ analysis }: { analysis: WebsiteAnalysis }) {
  return (
    <div className="min-w-0 bg-[#fbfaf6] p-8 print:p-10">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#6f685f]">{host(analysis.url)}</p>
      <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
        <Preview image={analysis.visual.desktop.screenshot} label="Desktop" width={1440} height={1100} />
        <Preview image={analysis.visual.mobile.screenshot} label="Mobile" width={390} height={844} />
      </div>
    </div>
  );
}

function Preview({
  height,
  image,
  label,
  width,
}: {
  height: number;
  image: string;
  label: string;
  width: number;
}) {
  return (
    <figure>
      <figcaption className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#6f685f]">{label}</figcaption>
      <div className={width < 500 ? "aspect-[9/19] overflow-hidden border border-[#171512]/15 bg-[#171512]" : "aspect-[16/10] overflow-hidden border border-[#171512]/15 bg-[#171512]"}>
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

function winnerLabel(winner: WebsiteComparison["verdicts"][number]["winner"], comparison: WebsiteComparison) {
  if (winner === "tie") {
    return "Effectively tied";
  }
  return winner === "left" ? host(comparison.left.url) : host(comparison.right.url);
}

function host(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
