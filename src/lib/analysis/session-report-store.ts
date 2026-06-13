import type { WebsiteAnalysis } from "@/types/analysis";
import type { WebsiteComparison } from "@/types/comparison";

const REPORT_INDEX_KEY = "website-dna:latest-analysis-id";
const REPORT_KEY_PREFIX = "website-dna:analysis:";
const COMPARISON_KEY_PREFIX = "website-dna:comparison:";

export function createAnalysisId(analysis: WebsiteAnalysis) {
  const host = safeHost(analysis.url);
  const stamp = new Date(analysis.analyzedAt).getTime().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${host}-${stamp}-${random}`;
}

export function saveAnalysisForReport(analysisId: string, analysis: WebsiteAnalysis) {
  window.localStorage.setItem(`${REPORT_KEY_PREFIX}${analysisId}`, JSON.stringify(analysis));
  window.localStorage.setItem(REPORT_INDEX_KEY, analysisId);
}

export function loadAnalysisForReport(analysisId: string) {
  const raw = window.localStorage.getItem(`${REPORT_KEY_PREFIX}${analysisId}`);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as WebsiteAnalysis;
  } catch {
    return null;
  }
}

export function createComparisonId(left: WebsiteAnalysis, right: WebsiteAnalysis) {
  const stamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${safeHost(left.url)}-vs-${safeHost(right.url)}-${stamp}-${random}`;
}

export function saveComparisonForReport(comparison: WebsiteComparison) {
  window.localStorage.setItem(`${COMPARISON_KEY_PREFIX}${comparison.id}`, JSON.stringify(comparison));
}

export function loadComparisonForReport(comparisonId: string) {
  const raw = window.localStorage.getItem(`${COMPARISON_KEY_PREFIX}${comparisonId}`);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as WebsiteComparison;
  } catch {
    return null;
  }
}

function safeHost(url: string) {
  try {
    return new URL(url).hostname.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  } catch {
    return "analysis";
  }
}
