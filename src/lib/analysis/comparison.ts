import type { WebsiteAnalysis } from "@/types/analysis";
import type { ComparisonSide, ComparisonVerdictItem } from "@/types/comparison";

export function buildComparisonVerdicts(
  left: WebsiteAnalysis,
  right: WebsiteAnalysis,
): ComparisonVerdictItem[] {
  return [
    compareMetric({
      label: "Brand maturity",
      left,
      right,
      leftValue: left.report.brandMaturity.score,
      rightValue: right.report.brandMaturity.score,
      higherIsBetter: true,
      suffix: "maturity score",
    }),
    compareMetric({
      label: "Minimalism",
      left,
      right,
      leftValue: left.visual.scores.minimalism,
      rightValue: right.visual.scores.minimalism,
      higherIsBetter: true,
      suffix: "minimalism score",
    }),
    compareMetric({
      label: "Visual hierarchy",
      left,
      right,
      leftValue: average(
        left.visual.desktop.metrics.visualHierarchy,
        left.visual.mobile.metrics.visualHierarchy,
      ),
      rightValue: average(
        right.visual.desktop.metrics.visualHierarchy,
        right.visual.mobile.metrics.visualHierarchy,
      ),
      higherIsBetter: true,
      suffix: "hierarchy score",
    }),
    compareMetric({
      label: "Product discipline",
      left,
      right,
      leftValue: disciplineScore(left),
      rightValue: disciplineScore(right),
      higherIsBetter: true,
      suffix: "discipline score",
    }),
  ];
}

function compareMetric({
  higherIsBetter,
  label,
  left,
  leftValue,
  right,
  rightValue,
  suffix,
}: {
  higherIsBetter: boolean;
  label: string;
  left: WebsiteAnalysis;
  leftValue: number;
  right: WebsiteAnalysis;
  rightValue: number;
  suffix: string;
}): ComparisonVerdictItem {
  const gap = Math.abs(leftValue - rightValue);
  const winner = pickWinner(leftValue, rightValue, higherIsBetter, 4);
  const winnerName = winner === "left" ? host(left.url) : winner === "right" ? host(right.url) : "Both sites";

  return {
    label,
    winner,
    explanation:
      winner === "tie"
        ? `${winnerName} are effectively tied: ${leftValue} vs ${rightValue} ${suffix}.`
        : `${winnerName} leads by ${gap} points: ${leftValue} vs ${rightValue} ${suffix}.`,
  };
}

function disciplineScore(analysis: WebsiteAnalysis) {
  return Math.round(
    analysis.report.brandMaturity.factors.typography * 0.18 +
      analysis.report.brandMaturity.factors.colors * 0.16 +
      analysis.report.brandMaturity.factors.spacing * 0.18 +
      analysis.report.brandMaturity.factors.radii * 0.12 +
      analysis.report.brandMaturity.factors.motion * 0.12 +
      analysis.culture.scores[0].score * 0.12 +
      analysis.visual.scores.clarity * 0.12,
  );
}

function pickWinner(
  leftValue: number,
  rightValue: number,
  higherIsBetter: boolean,
  tieThreshold: number,
): ComparisonSide {
  if (Math.abs(leftValue - rightValue) <= tieThreshold) {
    return "tie";
  }
  if (higherIsBetter) {
    return leftValue > rightValue ? "left" : "right";
  }
  return leftValue < rightValue ? "left" : "right";
}

function average(left: number, right: number) {
  return Math.round((left + right) / 2);
}

function host(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
