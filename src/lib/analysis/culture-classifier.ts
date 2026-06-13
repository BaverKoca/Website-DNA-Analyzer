import type {
  CultureScore,
  DesignCultureClassification,
  DesignCultureName,
  WebsiteAnalysis,
} from "@/types/analysis";

type CultureRule = {
  points: number;
  signal: string;
  test: (signals: DerivedDesignSignals) => boolean;
};

type CultureProfile = {
  culture: DesignCultureName;
  rules: CultureRule[];
};

type ClassificationInput = Omit<WebsiteAnalysis, "culture" | "report">;

type DerivedDesignSignals = {
  accentColors: number;
  averageRadius: number;
  componentDensity: "low" | "moderate" | "high";
  dominantFont: string;
  hasBlueAccent: boolean;
  hasBrightAccent: boolean;
  hasHeavyMotion: boolean;
  hasLargeType: boolean;
  hasMonoFont: boolean;
  hasPurpleAccent: boolean;
  hasSerifFont: boolean;
  hasStrongShadow: boolean;
  isDark: boolean;
  isLight: boolean;
  isMonochrome: boolean;
  motionIntensity: WebsiteAnalysis["motion"]["intensity"];
  radiusMode: "sharp" | "soft" | "rounded";
  shadowCount: number;
  spacingRhythm: string;
};

const CULTURE_PROFILES: CultureProfile[] = [
  {
    culture: "Linear / Product-led SaaS",
    rules: [
      rule(18, "8px spacing rhythm", (s) => s.spacingRhythm === "8px rhythm"),
      rule(14, "restrained monochrome palette", (s) => s.isMonochrome),
      rule(12, "soft but controlled radius scale", (s) => s.radiusMode === "soft"),
      rule(10, "low-to-moderate motion", (s) => ["low", "moderate"].includes(s.motionIntensity)),
      rule(10, "moderate interface density", (s) => s.componentDensity === "moderate"),
      rule(8, "neutral sans typography", (s) => !s.hasSerifFont),
    ],
  },
  {
    culture: "Vercel / AI SaaS",
    rules: [
      rule(20, "dark monochrome foundation", (s) => s.isDark && s.isMonochrome),
      rule(14, "sharp minimal surfaces", (s) => s.radiusMode === "sharp" || s.radiusMode === "soft"),
      rule(12, "mono or technical font signal", (s) => s.hasMonoFont),
      rule(10, "low elevation", (s) => s.shadowCount <= 2),
      rule(10, "controlled motion system", (s) => ["low", "moderate"].includes(s.motionIntensity)),
      rule(8, "sparse accent palette", (s) => s.accentColors <= 2),
    ],
  },
  {
    culture: "Apple / Premium minimalism",
    rules: [
      rule(20, "light neutral palette", (s) => s.isLight && s.isMonochrome),
      rule(16, "generous low-density layout", (s) => s.componentDensity === "low"),
      rule(14, "large refined typography", (s) => s.hasLargeType),
      rule(12, "soft radius language", (s) => s.radiusMode === "soft" || s.radiusMode === "rounded"),
      rule(10, "minimal animation footprint", (s) => ["none", "low"].includes(s.motionIntensity)),
      rule(8, "subtle elevation", (s) => s.shadowCount <= 2),
    ],
  },
  {
    culture: "Stripe / Developer fintech",
    rules: [
      rule(18, "blue or violet accent system", (s) => s.hasBlueAccent || s.hasPurpleAccent),
      rule(14, "technical typography signal", (s) => s.hasMonoFont),
      rule(12, "layered interface elevation", (s) => s.hasStrongShadow),
      rule(10, "8px product spacing", (s) => s.spacingRhythm === "8px rhythm"),
      rule(10, "moderate component density", (s) => s.componentDensity === "moderate"),
      rule(8, "measured motion", (s) => ["low", "moderate"].includes(s.motionIntensity)),
    ],
  },
  {
    culture: "Swiss editorial",
    rules: [
      rule(20, "grid-like 4px or 8px rhythm", (s) => ["4px rhythm", "8px rhythm"].includes(s.spacingRhythm)),
      rule(16, "sharp rectilinear composition", (s) => s.radiusMode === "sharp"),
      rule(14, "restrained palette", (s) => s.isMonochrome),
      rule(12, "high information density", (s) => s.componentDensity === "high"),
      rule(10, "low motion", (s) => ["none", "low"].includes(s.motionIntensity)),
    ],
  },
  {
    culture: "Luxury editorial",
    rules: [
      rule(22, "serif editorial typography", (s) => s.hasSerifFont),
      rule(16, "low-density spacious layout", (s) => s.componentDensity === "low"),
      rule(12, "minimal palette", (s) => s.isMonochrome),
      rule(10, "large display type", (s) => s.hasLargeType),
      rule(8, "quiet motion", (s) => ["none", "low"].includes(s.motionIntensity)),
      rule(8, "limited component elevation", (s) => s.shadowCount <= 2),
    ],
  },
  {
    culture: "Brutalist startup",
    rules: [
      rule(20, "sharp no-radius geometry", (s) => s.radiusMode === "sharp"),
      rule(14, "high contrast monochrome", (s) => s.isMonochrome),
      rule(12, "dense component surface", (s) => s.componentDensity === "high"),
      rule(10, "minimal shadows", (s) => s.shadowCount <= 1),
      rule(10, "mixed spacing rhythm", (s) => s.spacingRhythm === "mixed rhythm"),
      rule(8, "limited motion layer", (s) => ["none", "low"].includes(s.motionIntensity)),
    ],
  },
  {
    culture: "Web3 maximalist",
    rules: [
      rule(22, "bright accent-heavy palette", (s) => s.hasBrightAccent && s.accentColors >= 3),
      rule(14, "purple accent signal", (s) => s.hasPurpleAccent),
      rule(12, "high motion intensity", (s) => s.hasHeavyMotion),
      rule(10, "rounded digital surfaces", (s) => s.radiusMode === "rounded"),
      rule(8, "visible elevation effects", (s) => s.hasStrongShadow),
    ],
  },
  {
    culture: "Agency portfolio",
    rules: [
      rule(18, "large expressive type", (s) => s.hasLargeType),
      rule(14, "custom editorial or serif typography", (s) => s.hasSerifFont || !isSystemFont(s.dominantFont)),
      rule(12, "low-density presentation layout", (s) => s.componentDensity === "low"),
      rule(10, "motion-forward presentation", (s) => ["moderate", "high"].includes(s.motionIntensity)),
      rule(8, "mixed visual palette", (s) => !s.isMonochrome),
    ],
  },
  {
    culture: "YC B2B SaaS",
    rules: [
      rule(18, "plain sans product typography", (s) => !s.hasSerifFont),
      rule(14, "moderate-to-high component density", (s) =>
        ["moderate", "high"].includes(s.componentDensity),
      ),
      rule(12, "pragmatic 4px or 8px spacing", (s) => ["4px rhythm", "8px rhythm"].includes(s.spacingRhythm)),
      rule(10, "soft application radius", (s) => s.radiusMode === "soft"),
      rule(8, "low motion overhead", (s) => ["none", "low"].includes(s.motionIntensity)),
      rule(8, "limited palette complexity", (s) => s.accentColors <= 3),
    ],
  },
];

export function classifyDesignCulture(analysis: ClassificationInput): DesignCultureClassification {
  const signals = deriveSignals(analysis);
  const scores = CULTURE_PROFILES.map((profile) => scoreCulture(profile, signals)).sort(
    (a, b) => b.score - a.score || a.culture.localeCompare(b.culture),
  );
  const dominant = scores[0];
  const secondaryInfluences = scores.slice(1, 4).filter((score) => score.score >= 28);

  return {
    dominantCulture: dominant.culture,
    secondaryInfluences,
    scores,
    confidence: confidenceFromScores(scores),
    explanation: buildExplanation(dominant, analysis),
    strongestSignals: dominant.matchedSignals.slice(0, 5),
  };
}

function scoreCulture(profile: CultureProfile, signals: DerivedDesignSignals): CultureScore {
  const matchedRules = profile.rules.filter((profileRule) => profileRule.test(signals));
  const rawScore = matchedRules.reduce((sum, profileRule) => sum + profileRule.points, 0);
  const maxScore = profile.rules.reduce((sum, profileRule) => sum + profileRule.points, 0);

  return {
    culture: profile.culture,
    score: Math.round((rawScore / maxScore) * 100),
    matchedSignals: matchedRules.map((profileRule) => profileRule.signal),
  };
}

function deriveSignals(analysis: ClassificationInput): DerivedDesignSignals {
  const palette = analysis.colors.palette.map((token) => token.value);
  const nonNeutralColors = palette.filter((color) => !isNeutralColor(color));
  const fontNames = analysis.typography.fontFamilies.map((token) => token.value.toLowerCase());
  const fontSizes = analysis.typography.fontSizes.map((token) => Number.parseFloat(token.value));
  const radiusValues = analysis.radii.values.map((token) => Number.parseFloat(token.value));
  const averageRadius = average(radiusValues);
  const componentDensity = analysis.metadata.componentDensity;

  return {
    accentColors: nonNeutralColors.length,
    averageRadius,
    componentDensity,
    dominantFont: analysis.typography.dominantFont,
    hasBlueAccent: palette.some((color) => hueInRange(color, 190, 250)),
    hasBrightAccent: palette.some((color) => saturation(color) > 0.42 && luminance(color) > 0.42),
    hasHeavyMotion: analysis.motion.intensity === "high",
    hasLargeType: fontSizes.some((size) => size >= 32),
    hasMonoFont: fontNames.some((font) => /mono|code|geist|menlo|consolas|courier|plex/.test(font)),
    hasPurpleAccent: palette.some((color) => hueInRange(color, 255, 315)),
    hasSerifFont: fontNames.some((font) => /serif|georgia|times|garamond|playfair|caslon|didot/.test(font)),
    hasStrongShadow: analysis.shadows.values.length >= 3,
    isDark: luminance(analysis.colors.dominantColor) < 0.32,
    isLight: luminance(analysis.colors.dominantColor) > 0.72,
    isMonochrome: nonNeutralColors.length <= 2,
    motionIntensity: analysis.motion.intensity,
    radiusMode: averageRadius >= 14 ? "rounded" : averageRadius >= 3 ? "soft" : "sharp",
    shadowCount: analysis.shadows.values.length,
    spacingRhythm: analysis.spacing.rhythm,
  };
}

function buildExplanation(score: CultureScore, analysis: ClassificationInput) {
  const explanation = [
    `${score.culture} is the strongest deterministic match at ${score.score}%.`,
    `The dominant font is ${analysis.metadata.dominantFont}, with ${analysis.metadata.detectedSpacingRhythm} spacing.`,
    `The palette centers on ${analysis.metadata.dominantColor}, and component density reads as ${analysis.metadata.componentDensity}.`,
  ];

  if (score.matchedSignals.length > 0) {
    explanation.push(`Top rules matched: ${score.matchedSignals.slice(0, 3).join(", ")}.`);
  }

  return explanation;
}

function confidenceFromScores(scores: CultureScore[]): DesignCultureClassification["confidence"] {
  const [first, second] = scores;
  const gap = first.score - (second?.score ?? 0);

  if (first.score >= 70 && gap >= 12) {
    return "high";
  }
  if (first.score >= 48 && gap >= 6) {
    return "medium";
  }
  return "low";
}

function rule(points: number, signal: string, test: CultureRule["test"]): CultureRule {
  return { points, signal, test };
}

function isSystemFont(font: string) {
  return /inter|system|arial|helvetica|sans|roboto|sf pro|segoe/i.test(font);
}

function isNeutralColor(color: string) {
  const sat = saturation(color);
  return sat < 0.16;
}

function hueInRange(color: string, min: number, max: number) {
  const hue = hueFromHex(color);
  return hue >= min && hue <= max;
}

function luminance(color: string) {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return 0.5;
  }
  const [red, green, blue] = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function saturation(color: string) {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return 0;
  }
  const [red, green, blue] = rgb.map((channel) => channel / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  if (max === min) {
    return 0;
  }
  const lightness = (max + min) / 2;
  return lightness > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
}

function hueFromHex(color: string) {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return 0;
  }
  const [red, green, blue] = rgb.map((channel) => channel / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  if (delta === 0) {
    return 0;
  }

  let hue = 0;
  if (max === red) {
    hue = ((green - blue) / delta) % 6;
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  return Math.round(hue * 60 + (hue < 0 ? 360 : 0));
}

function hexToRgb(color: string) {
  const match = color.match(/^#([a-f0-9]{6})$/i);
  if (!match) {
    return null;
  }
  const hex = match[1];
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

function average(values: number[]) {
  const usableValues = values.filter((value) => Number.isFinite(value));
  if (usableValues.length === 0) {
    return 0;
  }
  return usableValues.reduce((sum, value) => sum + value, 0) / usableValues.length;
}
