import type { WebsiteAnalysis } from "@/types/analysis";

export type ComparisonSide = "left" | "right" | "tie";

export type ComparisonVerdictItem = {
  label: string;
  winner: ComparisonSide;
  explanation: string;
};

export type WebsiteComparison = {
  id: string;
  createdAt: string;
  left: WebsiteAnalysis;
  right: WebsiteAnalysis;
  verdicts: ComparisonVerdictItem[];
};
