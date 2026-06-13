export type AnalyzeRequest = {
  url: string;
};

export type FrequencyToken = {
  value: string;
  count: number;
  percentage: number;
};

export type TypographySystem = {
  fontFamilies: FrequencyToken[];
  fontSizes: FrequencyToken[];
  fontWeights: FrequencyToken[];
  dominantFont: string;
};

export type ColorSystem = {
  palette: FrequencyToken[];
  textColors: FrequencyToken[];
  backgroundColors: FrequencyToken[];
  dominantColor: string;
};

export type TokenScale = {
  values: FrequencyToken[];
};

export type SpacingSystem = TokenScale & {
  rhythm: string;
};

export type MotionProfile = {
  intensity: "none" | "low" | "moderate" | "high";
  transitions: FrequencyToken[];
  animations: FrequencyToken[];
  hasMotion: boolean;
};

export type AnalysisMetadata = {
  totalAnalyzedElements: number;
  totalVisibleElements: number;
  dominantFont: string;
  dominantColor: string;
  detectedSpacingRhythm: string;
  componentDensity: "low" | "moderate" | "high";
  analysisConfidence: {
    score: number;
    level: "low" | "medium" | "high";
    factors: {
      elementCoverage: number;
      visualConsistency: number;
      extractionCompleteness: number;
    };
  };
  durationMs: number;
  nodeLimit: number;
};

export type DesignCultureName =
  | "Linear / Product-led SaaS"
  | "Vercel / AI SaaS"
  | "Apple / Premium minimalism"
  | "Stripe / Developer fintech"
  | "Swiss editorial"
  | "Luxury editorial"
  | "Brutalist startup"
  | "Web3 maximalist"
  | "Agency portfolio"
  | "YC B2B SaaS";

export type CultureScore = {
  culture: DesignCultureName;
  score: number;
  matchedSignals: string[];
};

export type DesignCultureClassification = {
  dominantCulture: DesignCultureName;
  secondaryInfluences: CultureScore[];
  scores: CultureScore[];
  confidence: "low" | "medium" | "high";
  explanation: string[];
  strongestSignals: string[];
};

export type ReportSectionTitle =
  | "Executive Summary"
  | "Design Culture Verdict"
  | "Typography Personality"
  | "Color System Analysis"
  | "Spacing Philosophy"
  | "Motion Language"
  | "Component Maturity"
  | "Brand Maturity Score"
  | "Final Verdict";

export type ReportSection = {
  title: ReportSectionTitle;
  label: string;
  body: string;
  evidence: string[];
};

export type BrandMaturityScore = {
  score: number;
  level: "emerging" | "developing" | "mature" | "premium";
  factors: {
    typography: number;
    colors: number;
    spacing: number;
    radii: number;
    motion: number;
    componentDensity: number;
  };
};

export type DnaReport = {
  generatedAt: string;
  brandMaturity: BrandMaturityScore;
  sections: ReportSection[];
};

export type VisualViewportAnalysis = {
  viewport: "desktop" | "mobile";
  width: number;
  height: number;
  screenshot: string;
  metrics: {
    whitespaceDensity: number;
    layoutSymmetry: number;
    visualHierarchy: number;
    heroStructure: number;
    ctaProminence: number;
    navigationComplexity: number;
    sectionRhythm: number;
    contentDensity: number;
    visualContrastDistribution: number;
  };
  observations: string[];
};

export type VisualDnaAnalysis = {
  desktop: VisualViewportAnalysis;
  mobile: VisualViewportAnalysis;
  scores: {
    visualBalance: number;
    clarity: number;
    visualAggression: number;
    minimalism: number;
  };
  hierarchyAnalysis: string[];
  layoutObservations: string[];
};

export type WebsiteAnalysis = {
  url: string;
  analyzedAt: string;
  typography: TypographySystem;
  colors: ColorSystem;
  spacing: SpacingSystem;
  radii: TokenScale;
  shadows: TokenScale;
  motion: MotionProfile;
  metadata: AnalysisMetadata;
  culture: DesignCultureClassification;
  report: DnaReport;
  visual: VisualDnaAnalysis;
};

export type AnalyzeResponse =
  | {
      ok: true;
      analysis: WebsiteAnalysis;
    }
  | {
      ok: false;
      error: string;
    };
