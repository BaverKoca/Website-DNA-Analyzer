"use client";

import { createAnalysisId, saveAnalysisForReport } from "@/lib/analysis/session-report-store";
import type { WebsiteAnalysis } from "@/types/analysis";

type ExportReportButtonProps = {
  analysis: WebsiteAnalysis;
};

export function ExportReportButton({ analysis }: ExportReportButtonProps) {
  function handleExport() {
    const analysisId = createAnalysisId(analysis);
    saveAnalysisForReport(analysisId, analysis);
    window.open(`/report/${analysisId}`, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      className="border border-bone/30 bg-bone px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-ink transition hover:bg-white focus:ring-2 focus:ring-ember/50"
      onClick={handleExport}
      type="button"
    >
      Export Report
    </button>
  );
}
