import type {
  ColorSystem,
  MotionProfile,
  SpacingSystem,
  TokenScale,
  TypographySystem,
  VisualDnaAnalysis,
  WebsiteAnalysis,
} from "@/types/analysis";
import type { ExtractionResult } from "@/lib/analysis/extractor";
import { aggregateFrequency, dominantValue } from "@/lib/analysis/aggregation";
import { classifyDesignCulture } from "@/lib/analysis/culture-classifier";
import { generateDnaReport } from "@/lib/analysis/report-generator";
import {
  normalizeColor,
  normalizeFontFamily,
  normalizeFontSize,
  normalizeFontWeight,
  normalizeLength,
  normalizeMotionValue,
  normalizeShadow,
} from "@/lib/analysis/normalization";

export type BuildAnalysisInput = {
  url: string;
  analyzedAt: string;
  durationMs: number;
  extraction: ExtractionResult;
  nodeLimit: number;
  visual: VisualDnaAnalysis;
};

export function buildWebsiteAnalysis({
  url,
  analyzedAt,
  durationMs,
  extraction,
  nodeLimit,
  visual,
}: BuildAnalysisInput): WebsiteAnalysis {
  const typography = buildTypographySystem(extraction);
  const colors = buildColorSystem(extraction);
  const spacing = buildSpacingSystem(extraction);
  const radii = buildTokenScale(extraction.elements.flatMap((element) => element.radii));
  const shadows = buildTokenScale(extraction.elements.map((element) => element.boxShadow), normalizeShadow);
  const motion = buildMotionProfile(extraction);
  const baseAnalysis = {
    url,
    analyzedAt,
    typography,
    colors,
    spacing,
    radii,
    shadows,
    motion,
    metadata: {
      totalAnalyzedElements: extraction.elements.length,
      totalVisibleElements: extraction.totalVisibleElements,
      dominantFont: typography.dominantFont,
      dominantColor: colors.dominantColor,
      detectedSpacingRhythm: spacing.rhythm,
      componentDensity: detectComponentDensity(extraction.elements.length),
      analysisConfidence: calculateAnalysisConfidence({
        colors,
        extraction,
        motion,
        radii,
        spacing,
        typography,
      }),
      durationMs,
      nodeLimit,
    },
    visual,
  } satisfies Omit<WebsiteAnalysis, "culture" | "report">;
  const analysisWithCulture = {
    ...baseAnalysis,
    culture: classifyDesignCulture(baseAnalysis),
  } satisfies Omit<WebsiteAnalysis, "report">;

  return {
    ...analysisWithCulture,
    report: generateDnaReport(analysisWithCulture),
  };
}

function buildTypographySystem(extraction: ExtractionResult): TypographySystem {
  const fontFamilies = aggregateFrequency(
    extraction.elements.map((element) => normalizeFontFamily(element.fontFamily)),
  );
  const fontSizes = aggregateFrequency(
    extraction.elements.map((element) => normalizeFontSize(element.fontSize)),
  );
  const fontWeights = aggregateFrequency(
    extraction.elements.map((element) => normalizeFontWeight(element.fontWeight)),
  );

  return {
    fontFamilies,
    fontSizes,
    fontWeights,
    dominantFont: dominantValue(fontFamilies),
  };
}

function buildColorSystem(extraction: ExtractionResult): ColorSystem {
  const textColors = aggregateFrequency(
    extraction.elements
      .map((element) => normalizeColor(element.color))
      .filter((color): color is string => color !== null),
  );
  const backgroundColors = aggregateFrequency(
    extraction.elements
      .map((element) => normalizeColor(element.backgroundColor))
      .filter((color): color is string => color !== null),
  );
  const palette = aggregateFrequency(
    [...textColors, ...backgroundColors].flatMap((token) =>
      Array.from({ length: token.count }, () => token.value),
    ),
    10,
  );

  return {
    palette,
    textColors,
    backgroundColors,
    dominantColor: dominantValue(palette),
  };
}

function buildSpacingSystem(extraction: ExtractionResult): SpacingSystem {
  const values = aggregateFrequency(
    extraction.elements
      .flatMap((element) => [...element.margins, ...element.paddings, ...element.gaps])
      .map((value) => normalizeLength(value))
      .filter((value): value is string => value !== null),
    14,
  );

  return {
    values,
    rhythm: detectSpacingRhythm(values.map((value) => value.value)),
  };
}

function buildTokenScale(
  rawValues: string[],
  normalizer: (value: string) => string | null = normalizeLength,
): TokenScale {
  return {
    values: aggregateFrequency(
      rawValues.map((value) => normalizer(value)).filter((value): value is string => value !== null),
      12,
    ),
  };
}

function buildMotionProfile(extraction: ExtractionResult): MotionProfile {
  const transitions = aggregateFrequency(
    extraction.elements
      .map((element) => normalizeMotionValue(element.transition))
      .filter((value): value is string => value !== null),
    8,
  );
  const animations = aggregateFrequency(
    extraction.elements
      .map((element) => normalizeMotionValue(element.animation))
      .filter((value): value is string => value !== null),
    8,
  );
  const motionCount = transitions.reduce((sum, token) => sum + token.count, 0) +
    animations.reduce((sum, token) => sum + token.count, 0);
  const ratio = extraction.elements.length ? motionCount / extraction.elements.length : 0;

  return {
    transitions,
    animations,
    hasMotion: motionCount > 0,
    intensity: ratio > 0.55 ? "high" : ratio > 0.25 ? "moderate" : ratio > 0 ? "low" : "none",
  };
}

function detectSpacingRhythm(values: string[]) {
  const numericValues = values
    .map((value) => Number.parseFloat(value))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  if (numericValues.length < 3) {
    return "insufficient signal";
  }

  const hasFourPoint = numericValues.filter((value) => value % 4 === 0).length / numericValues.length;
  const hasEightPoint = numericValues.filter((value) => value % 8 === 0).length / numericValues.length;

  if (hasEightPoint >= 0.55) {
    return "8px rhythm";
  }
  if (hasFourPoint >= 0.55) {
    return "4px rhythm";
  }
  return "mixed rhythm";
}

function detectComponentDensity(analyzedElements: number): WebsiteAnalysis["metadata"]["componentDensity"] {
  if (analyzedElements >= 340) {
    return "high";
  }
  if (analyzedElements >= 160) {
    return "moderate";
  }
  return "low";
}

function calculateAnalysisConfidence({
  colors,
  extraction,
  motion,
  radii,
  spacing,
  typography,
}: {
  colors: ColorSystem;
  extraction: ExtractionResult;
  motion: MotionProfile;
  radii: TokenScale;
  spacing: SpacingSystem;
  typography: TypographySystem;
}): WebsiteAnalysis["metadata"]["analysisConfidence"] {
  const elementCoverage = clampScore(Math.round((extraction.elements.length / 180) * 100));
  const visualConsistency = clampScore(
    Math.round(
      ((typography.fontFamilies[0]?.percentage ?? 0) * 0.28) +
        ((colors.palette[0]?.percentage ?? 0) * 0.24) +
        (spacing.rhythm.includes("rhythm") && spacing.rhythm !== "mixed rhythm" ? 24 : 10) +
        (radii.values.length <= 5 ? 16 : 8) +
        (motion.intensity === "low" || motion.intensity === "moderate" ? 8 : 4),
    ),
  );
  const extractionCompleteness = clampScore(
    Math.round(
      (typography.fontFamilies.length ? 18 : 0) +
        (typography.fontSizes.length ? 16 : 0) +
        (colors.palette.length ? 18 : 0) +
        (spacing.values.length ? 16 : 0) +
        (radii.values.length ? 12 : 0) +
        (extraction.totalVisibleElements > 0 ? 20 : 0),
    ),
  );
  const score = Math.round(
    elementCoverage * 0.34 + visualConsistency * 0.33 + extractionCompleteness * 0.33,
  );

  return {
    score,
    level: score >= 76 ? "high" : score >= 52 ? "medium" : "low",
    factors: {
      elementCoverage,
      visualConsistency,
      extractionCompleteness,
    },
  };
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}
