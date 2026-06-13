"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { loadAnalysisForReport } from "@/lib/analysis/session-report-store";
import type { FrequencyToken, WebsiteAnalysis } from "@/types/analysis";

type ReportDocumentProps = {
  analysisId: string;
};

export function ReportDocument({ analysisId }: ReportDocumentProps) {
  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [isMissing, setIsMissing] = useState(false);

  useEffect(() => {
    const storedAnalysis = loadAnalysisForReport(analysisId);
    setAnalysis(storedAnalysis);
    setIsMissing(!storedAnalysis);
  }, [analysisId]);

  const formattedDate = useMemo(() => {
    if (!analysis) {
      return "";
    }
    return new Intl.DateTimeFormat("en", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(analysis.analyzedAt));
  }, [analysis]);

  if (isMissing) {
    return (
      <main className="min-h-screen bg-[#f4f1ea] px-6 py-12 text-[#171512]">
        <div className="mx-auto max-w-3xl border border-[#171512]/20 bg-white p-10">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#8a6a2f]">Report unavailable</p>
          <h1 className="mt-5 text-5xl leading-none">This report is not in the current browser session.</h1>
          <p className="mt-5 text-base leading-7 text-[#5f5a52]">
            Return to the dashboard, run or select an analysis, then use Export Report again.
          </p>
        </div>
      </main>
    );
  }

  if (!analysis) {
    return <main className="min-h-screen bg-[#f4f1ea]" />;
  }

  return (
    <main className="min-h-screen bg-[#f4f1ea] px-4 py-6 text-[#171512] print:bg-white print:px-0 print:py-0">
      <article className="mx-auto max-w-6xl overflow-hidden bg-[#fbfaf6] shadow-2xl shadow-black/10 print:max-w-none print:shadow-none">
        <ReportHero analysis={analysis} formattedDate={formattedDate} />
        <ReportSummary analysis={analysis} />
        <ReportScreenshots analysis={analysis} />
        <ReportSections analysis={analysis} />
        <ReportSystems analysis={analysis} />
      </article>
    </main>
  );
}

function ReportHero({ analysis, formattedDate }: { analysis: WebsiteAnalysis; formattedDate: string }) {
  return (
    <header className="border-b border-[#171512]/15 px-8 py-10 print:px-10">
      <div className="flex flex-col justify-between gap-8 md:flex-row">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[#9b7632]">Website DNA Audit</p>
          <h1 className="mt-5 max-w-4xl text-6xl leading-[0.92] tracking-[-0.02em] text-[#171512] md:text-7xl">
            Premium design intelligence report.
          </h1>
        </div>
        <div className="min-w-0 border border-[#171512]/15 p-5 md:min-w-64">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#6f685f]">Analyzed URL</p>
          <p className="mt-3 break-all text-lg">{analysis.url}</p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-[#6f685f]">Timestamp</p>
          <p className="mt-3 text-sm">{formattedDate}</p>
        </div>
      </div>
    </header>
  );
}

function ReportSummary({ analysis }: { analysis: WebsiteAnalysis }) {
  const topScores = analysis.culture.scores.slice(0, 6);

  return (
    <section className="grid border-b border-[#171512]/15 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 p-8 print:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#9b7632]">Dominant culture</p>
        <h2 className="mt-4 break-words text-5xl leading-none">{analysis.culture.dominantCulture}</h2>
        <p className="mt-5 max-w-3xl break-words text-base leading-7 text-[#5f5a52]">
          {analysis.report.sections[0]?.body}
        </p>
        <div className="mt-7 grid gap-3 md:grid-cols-3">
          <ScoreCard label="Brand Maturity" value={`${analysis.report.brandMaturity.score}/100`} />
          <ScoreCard label="Visual Balance" value={`${analysis.visual.scores.visualBalance}/100`} />
          <ScoreCard label="Clarity" value={`${analysis.visual.scores.clarity}/100`} />
        </div>
      </div>
      <div className="min-w-0 border-t border-[#171512]/15 p-8 lg:border-l lg:border-t-0 print:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#6f685f]">Culture score breakdown</p>
        <div className="mt-5 space-y-4">
          {topScores.map((score) => (
            <ReportBar key={score.culture} label={score.culture} score={score.score} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReportScreenshots({ analysis }: { analysis: WebsiteAnalysis }) {
  return (
    <section className="border-b border-[#171512]/15 p-8 print:p-10">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#9b7632]">Visual DNA</p>
          <h2 className="mt-3 text-4xl leading-none">Desktop and mobile captures</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-[#5f5a52]">
          Screenshots are captured in-memory during analysis and embedded in this session report for export.
        </p>
      </div>
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
        <Preview image={analysis.visual.desktop.screenshot} label="Desktop screenshot" width={1440} height={1100} />
        <Preview
          image={analysis.visual.mobile.screenshot}
          label="Mobile screenshot"
          width={390}
          height={844}
          mobile
        />
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <ScoreCard label="Whitespace" value={`${analysis.visual.desktop.metrics.whitespaceDensity}/100`} />
        <ScoreCard label="Hierarchy" value={`${analysis.visual.desktop.metrics.visualHierarchy}/100`} />
        <ScoreCard label="CTA Prominence" value={`${analysis.visual.desktop.metrics.ctaProminence}/100`} />
        <ScoreCard label="Minimalism" value={`${analysis.visual.scores.minimalism}/100`} />
      </div>
    </section>
  );
}

function ReportSections({ analysis }: { analysis: WebsiteAnalysis }) {
  return (
    <section className="border-b border-[#171512]/15 p-8 print:p-10">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#9b7632]">DNA Report</p>
      <div className="mt-5 grid gap-px overflow-hidden border border-[#171512]/15 bg-[#171512]/15 md:grid-cols-2">
        {analysis.report.sections.map((section) => (
          <article className="break-inside-avoid overflow-hidden bg-[#fbfaf6] p-5" key={section.title}>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#6f685f]">{section.title}</p>
            <h3 className="mt-3 text-2xl leading-tight">{section.label}</h3>
            <p className="mt-4 break-words text-sm leading-6 text-[#5f5a52]">{section.body}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {section.evidence.slice(0, 4).map((item) => (
                <span className="max-w-full break-words border border-[#171512]/15 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#6f685f]" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReportSystems({ analysis }: { analysis: WebsiteAnalysis }) {
  return (
    <section className="p-8 print:p-10">
      <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#9b7632]">Extracted systems</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <SystemBlock label="Typography" primary={analysis.typography.dominantFont} tokens={analysis.typography.fontFamilies} />
        <SystemBlock label="Color" primary={analysis.colors.dominantColor} tokens={analysis.colors.palette} swatches />
        <SystemBlock label="Spacing" primary={analysis.spacing.rhythm} tokens={analysis.spacing.values} />
        <SystemBlock label="Radius" primary={analysis.radii.values[0]?.value ?? "none"} tokens={analysis.radii.values} />
        <SystemBlock label="Shadow" primary={`${analysis.shadows.values.length} shadow tokens`} tokens={analysis.shadows.values} />
        <SystemBlock label="Motion" primary={analysis.motion.intensity} tokens={[...analysis.motion.transitions, ...analysis.motion.animations]} />
      </div>
    </section>
  );
}

function Preview({
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
    <figure className={mobile ? "mx-auto w-full max-w-[230px]" : "min-w-0"}>
      <figcaption className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#6f685f]">{label}</figcaption>
      <div className={mobile ? "aspect-[9/19] overflow-hidden border border-[#171512]/15 bg-[#171512]" : "aspect-[16/10] overflow-hidden border border-[#171512]/15 bg-[#171512]"}>
        <Image
          alt={label}
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

function ScoreCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border border-[#171512]/15 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6f685f]">{label}</p>
      <p className="mt-2 truncate text-3xl leading-none" title={value}>{value}</p>
    </div>
  );
}

function ReportBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3 text-xs">
        <span className="min-w-0 truncate" title={label}>{label}</span>
        <span className="font-mono">{score}%</span>
      </div>
      <div className="h-1.5 bg-[#171512]/10">
        <div className="h-full bg-[#171512]" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function SystemBlock({
  label,
  primary,
  swatches = false,
  tokens,
}: {
  label: string;
  primary: string;
  swatches?: boolean;
  tokens: FrequencyToken[];
}) {
  return (
    <article className="min-w-0 break-inside-avoid overflow-hidden border border-[#171512]/15 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6f685f]">{label}</p>
      <h3 className="mt-3 break-words text-2xl leading-tight">{primary}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {tokens.slice(0, 8).map((token) => (
          <span className="inline-flex max-w-full items-center gap-2 break-all border border-[#171512]/15 px-2.5 py-1.5 font-mono text-[10px] text-[#5f5a52]" key={token.value}>
            {swatches ? <span className="h-3 w-3 border border-[#171512]/20" style={{ background: token.value }} /> : null}
            {token.value}
          </span>
        ))}
      </div>
    </article>
  );
}
