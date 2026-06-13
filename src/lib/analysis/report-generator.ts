import type {
  BrandMaturityScore,
  DnaReport,
  FrequencyToken,
  ReportSection,
  WebsiteAnalysis,
} from "@/types/analysis";

type ReportInput = Omit<WebsiteAnalysis, "report">;

export function generateDnaReport(analysis: ReportInput): DnaReport {
  const brandMaturity = calculateBrandMaturity(analysis);
  const secondary = formatSecondaryInfluences(analysis);

  return {
    generatedAt: analysis.analyzedAt,
    brandMaturity,
    sections: [
      section(
        "Executive Summary",
        "Overall Read",
        `The site resolves as ${articleFor(analysis.culture.dominantCulture)} ${analysis.culture.dominantCulture} system with ${analysis.culture.confidence} classifier confidence. Its strongest signature is the combination of ${analysis.metadata.dominantFont}, ${analysis.metadata.dominantColor}, and ${analysis.metadata.detectedSpacingRhythm}.`,
        [
          `${analysis.metadata.totalAnalyzedElements} elements sampled from ${analysis.metadata.totalVisibleElements} visible candidates`,
          `${analysis.colors.palette.length} recurring color tokens`,
          `${analysis.spacing.values.length} spacing tokens`,
        ],
      ),
      section(
        "Design Culture Verdict",
        "Culture Match",
        `${analysis.culture.dominantCulture} leads the profile at ${analysis.culture.scores[0]?.score ?? 0}%. ${secondary} The match is driven by ${sentenceList(analysis.culture.strongestSignals)}.`,
        [
          `Confidence: ${analysis.culture.confidence}`,
          `Top score: ${analysis.culture.scores[0]?.score ?? 0}%`,
          `Secondary influences: ${analysis.culture.secondaryInfluences.length || 0}`,
        ],
      ),
      section(
        "Typography Personality",
        "Type System",
        typographyNarrative(analysis),
        [
          `Dominant family: ${analysis.typography.dominantFont}`,
          `Common sizes: ${tokenValues(analysis.typography.fontSizes, 4)}`,
          `Common weights: ${tokenValues(analysis.typography.fontWeights, 4)}`,
        ],
      ),
      section(
        "Color System Analysis",
        "Palette",
        colorNarrative(analysis),
        [
          `Dominant color: ${analysis.colors.dominantColor}`,
          `Palette: ${tokenValues(analysis.colors.palette, 6)}`,
          `Text color leader: ${analysis.colors.textColors[0]?.value ?? "unknown"}`,
        ],
      ),
      section(
        "Spacing Philosophy",
        "Rhythm",
        spacingNarrative(analysis),
        [
          `Rhythm: ${analysis.spacing.rhythm}`,
          `Spacing tokens: ${tokenValues(analysis.spacing.values, 8)}`,
          `Density: ${analysis.metadata.componentDensity}`,
        ],
      ),
      section(
        "Motion Language",
        "Behavior",
        motionNarrative(analysis),
        [
          `Intensity: ${analysis.motion.intensity}`,
          `Transition tokens: ${analysis.motion.transitions.length}`,
          `Animation tokens: ${analysis.motion.animations.length}`,
        ],
      ),
      section(
        "Component Maturity",
        "Interface System",
        componentNarrative(analysis),
        [
          `Radius tokens: ${tokenValues(analysis.radii.values, 5)}`,
          `Shadow tokens: ${analysis.shadows.values.length}`,
          `Component density: ${analysis.metadata.componentDensity}`,
        ],
      ),
      section(
        "Brand Maturity Score",
        brandMaturity.level,
        `The deterministic maturity score is ${brandMaturity.score}/100. The system is strongest in ${topMaturityFactor(brandMaturity)} and weakest in ${lowestMaturityFactor(brandMaturity)}, which gives the brand a ${brandMaturity.level} level of design-system control.`,
        [
          `Typography: ${brandMaturity.factors.typography}`,
          `Colors: ${brandMaturity.factors.colors}`,
          `Spacing: ${brandMaturity.factors.spacing}`,
          `Radii: ${brandMaturity.factors.radii}`,
          `Motion: ${brandMaturity.factors.motion}`,
          `Density: ${brandMaturity.factors.componentDensity}`,
        ],
      ),
      section(
        "Final Verdict",
        "Audit Close",
        finalVerdict(analysis, brandMaturity),
        [
          `Dominant culture: ${analysis.culture.dominantCulture}`,
          `Brand maturity: ${brandMaturity.score}/100`,
          `Core signal: ${analysis.culture.strongestSignals[0] ?? "no dominant signal"}`,
        ],
      ),
    ],
  };
}

function calculateBrandMaturity(analysis: ReportInput): BrandMaturityScore {
  const typography = consistencyScore(analysis.typography.fontFamilies, 32) +
    consistencyScore(analysis.typography.fontSizes, 28) +
    consistencyScore(analysis.typography.fontWeights, 20);
  const colors = consistencyScore(analysis.colors.palette, 48) +
    boundedTokenScore(analysis.colors.palette.length, 3, 8, 28);
  const spacing = rhythmScore(analysis.spacing.rhythm) + boundedTokenScore(analysis.spacing.values.length, 4, 10, 28);
  const radii = boundedTokenScore(analysis.radii.values.length, 1, 5, 80);
  const motion = motionScore(analysis);
  const componentDensity = densityScore(analysis.metadata.componentDensity);

  const factors = {
    typography: clamp(Math.round(20 + typography), 0, 100),
    colors: clamp(Math.round(24 + colors), 0, 100),
    spacing: clamp(Math.round(18 + spacing), 0, 100),
    radii: clamp(Math.round(radii), 0, 100),
    motion: clamp(Math.round(motion), 0, 100),
    componentDensity,
  };
  const score = Math.round(
    factors.typography * 0.18 +
      factors.colors * 0.18 +
      factors.spacing * 0.18 +
      factors.radii * 0.14 +
      factors.motion * 0.14 +
      factors.componentDensity * 0.18,
  );

  return {
    score,
    level: score >= 82 ? "premium" : score >= 68 ? "mature" : score >= 52 ? "developing" : "emerging",
    factors,
  };
}

function typographyNarrative(analysis: ReportInput) {
  const sizes = tokenValues(analysis.typography.fontSizes, 3);
  const weights = tokenValues(analysis.typography.fontWeights, 3);
  return `${analysis.typography.dominantFont} gives the interface its primary voice. The detected size ladder (${sizes}) and weight range (${weights}) suggest ${analysis.typography.fontSizes.length <= 5 ? "a compact typographic system" : "a broader editorial hierarchy"} with ${analysis.typography.fontFamilies.length <= 2 ? "tight font governance" : "multiple font voices in circulation"}.`;
}

function colorNarrative(analysis: ReportInput) {
  const palette = tokenValues(analysis.colors.palette, 5);
  return `The palette is anchored by ${analysis.colors.dominantColor}. Recurring values (${palette}) create ${analysis.colors.palette.length <= 5 ? "a restrained color economy" : "a wider chromatic field"}, with text and background tokens carrying most of the brand atmosphere.`;
}

function spacingNarrative(analysis: ReportInput) {
  return `Spacing resolves to ${analysis.spacing.rhythm}. The repeated values (${tokenValues(analysis.spacing.values, 7)}) point to ${analysis.spacing.rhythm.includes("8px") || analysis.spacing.rhythm.includes("4px") ? "a deliberate layout grid" : "a looser spacing model"} and a ${analysis.metadata.componentDensity} component density.`;
}

function motionNarrative(analysis: ReportInput) {
  if (!analysis.motion.hasMotion) {
    return "Motion is nearly absent in the sampled surface. The page reads as static, controlled, and intentionally quiet.";
  }
  return `Motion intensity reads as ${analysis.motion.intensity}. The system exposes ${analysis.motion.transitions.length} transition token groups and ${analysis.motion.animations.length} animation token groups, giving the interface ${analysis.motion.intensity === "high" ? "a visibly animated presentation layer" : "measured behavioral polish"}.`;
}

function componentNarrative(analysis: ReportInput) {
  const radius = analysis.radii.values[0]?.value ?? "none";
  const shadow = analysis.shadows.values.length === 0 ? "no recurring shadow system" : `${analysis.shadows.values.length} shadow tokens`;
  return `Components use ${radius} as the leading radius signal and ${shadow}. Combined with ${analysis.metadata.componentDensity} density, the surface feels ${analysis.metadata.componentDensity === "high" ? "operational and information-rich" : analysis.metadata.componentDensity === "moderate" ? "structured and product-oriented" : "spacious and presentation-led"}.`;
}

function finalVerdict(analysis: ReportInput, maturity: BrandMaturityScore) {
  return `The brand system is ${maturity.level}, scoring ${maturity.score}/100. It is best understood as ${articleFor(analysis.culture.dominantCulture)} ${analysis.culture.dominantCulture} expression with ${analysis.culture.secondaryInfluences.length > 0 ? `${analysis.culture.secondaryInfluences[0].culture} undertones` : "limited secondary noise"}. The strongest upgrade path is to preserve the current signal while tightening the lowest-scoring maturity factor.`;
}

function section(title: ReportSection["title"], label: string, body: string, evidence: string[]): ReportSection {
  return { title, label, body, evidence };
}

function formatSecondaryInfluences(analysis: ReportInput) {
  if (analysis.culture.secondaryInfluences.length === 0) {
    return "No secondary culture crossed the influence threshold.";
  }
  return `Secondary influence comes from ${analysis.culture.secondaryInfluences
    .slice(0, 2)
    .map((influence) => `${influence.culture} (${influence.score}%)`)
    .join(" and ")}.`;
}

function tokenValues(tokens: FrequencyToken[], limit: number) {
  if (tokens.length === 0) {
    return "none detected";
  }
  return tokens
    .slice(0, limit)
    .map((token) => token.value)
    .join(", ");
}

function sentenceList(items: string[]) {
  if (items.length === 0) {
    return "limited detectable signal";
  }
  if (items.length === 1) {
    return items[0];
  }
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function consistencyScore(tokens: FrequencyToken[], maxPoints: number) {
  const topPercentage = tokens[0]?.percentage ?? 0;
  return (topPercentage / 100) * maxPoints;
}

function boundedTokenScore(count: number, min: number, max: number, points: number) {
  if (count < min) {
    return points * 0.55;
  }
  if (count <= max) {
    return points;
  }
  return Math.max(points * 0.35, points - (count - max) * 8);
}

function rhythmScore(rhythm: string) {
  if (rhythm === "8px rhythm") {
    return 44;
  }
  if (rhythm === "4px rhythm") {
    return 38;
  }
  if (rhythm === "mixed rhythm") {
    return 22;
  }
  return 12;
}

function motionScore(analysis: ReportInput) {
  const tokenCount = analysis.motion.transitions.length + analysis.motion.animations.length;
  if (analysis.motion.intensity === "none") {
    return 58;
  }
  if (analysis.motion.intensity === "low") {
    return tokenCount <= 5 ? 86 : 72;
  }
  if (analysis.motion.intensity === "moderate") {
    return tokenCount <= 8 ? 82 : 68;
  }
  return tokenCount <= 8 ? 66 : 48;
}

function densityScore(density: ReportInput["metadata"]["componentDensity"]) {
  if (density === "moderate") {
    return 86;
  }
  if (density === "low") {
    return 76;
  }
  return 70;
}

function topMaturityFactor(maturity: BrandMaturityScore) {
  return factorEntries(maturity).sort((a, b) => b[1] - a[1])[0][0];
}

function lowestMaturityFactor(maturity: BrandMaturityScore) {
  return factorEntries(maturity).sort((a, b) => a[1] - b[1])[0][0];
}

function factorEntries(maturity: BrandMaturityScore) {
  return Object.entries(maturity.factors) as Array<[keyof BrandMaturityScore["factors"], number]>;
}

function articleFor(value: string) {
  return /^[aeiou]/i.test(value) ? "an" : "a";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
