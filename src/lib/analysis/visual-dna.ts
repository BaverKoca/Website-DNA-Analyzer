import type { Page } from "playwright";
import type { VisualDnaAnalysis, VisualViewportAnalysis } from "@/types/analysis";

type ViewportName = "desktop" | "mobile";

type RawVisualMetrics = {
  whitespaceDensity: number;
  layoutSymmetry: number;
  visualHierarchy: number;
  heroStructure: number;
  ctaProminence: number;
  navigationComplexity: number;
  sectionRhythm: number;
  contentDensity: number;
  visualContrastDistribution: number;
  elementCount: number;
  navItemCount: number;
  ctaCount: number;
  largestTextSize: number;
};

const VIEWPORTS: Record<ViewportName, { width: number; height: number }> = {
  desktop: { width: 1280, height: 900 },
  mobile: { width: 390, height: 760 },
};

export async function analyzeVisualDna(page: Page, url: string, timeoutMs: number): Promise<VisualDnaAnalysis> {
  const desktop = await captureViewportAnalysis(page, "desktop");

  await page.setViewportSize(VIEWPORTS.mobile);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
  await page.waitForLoadState("networkidle", { timeout: Math.min(timeoutMs, 7000) }).catch(() => null);
  const mobile = await captureViewportAnalysis(page, "mobile");

  return {
    desktop,
    mobile,
    scores: buildVisualScores(desktop.metrics, mobile.metrics),
    hierarchyAnalysis: buildHierarchyAnalysis(desktop, mobile),
    layoutObservations: buildLayoutObservations(desktop, mobile),
  };
}

async function captureViewportAnalysis(page: Page, viewport: ViewportName): Promise<VisualViewportAnalysis> {
  await page.setViewportSize(VIEWPORTS[viewport]);
  const rawMetrics = await collectVisualMetrics(page);
  const screenshotBuffer = await page.screenshot({
    animations: "disabled",
    fullPage: false,
    quality: viewport === "desktop" ? 44 : 50,
    type: "jpeg",
  });

  return {
    viewport,
    width: VIEWPORTS[viewport].width,
    height: VIEWPORTS[viewport].height,
    screenshot: `data:image/jpeg;base64,${screenshotBuffer.toString("base64")}`,
    metrics: {
      whitespaceDensity: rawMetrics.whitespaceDensity,
      layoutSymmetry: rawMetrics.layoutSymmetry,
      visualHierarchy: rawMetrics.visualHierarchy,
      heroStructure: rawMetrics.heroStructure,
      ctaProminence: rawMetrics.ctaProminence,
      navigationComplexity: rawMetrics.navigationComplexity,
      sectionRhythm: rawMetrics.sectionRhythm,
      contentDensity: rawMetrics.contentDensity,
      visualContrastDistribution: rawMetrics.visualContrastDistribution,
    },
    observations: viewportObservations(rawMetrics),
  };
}

async function collectVisualMetrics(page: Page): Promise<RawVisualMetrics> {
  return page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const viewportArea = viewportWidth * viewportHeight;
    const visibleElements = Array.from(document.body.querySelectorAll<HTMLElement>("*"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        const area = Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0)) *
          Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
        const text = (element.innerText || "").trim();

        if (
          area < 32 ||
          rect.width < 3 ||
          rect.height < 3 ||
          style.display === "none" ||
          style.visibility === "hidden" ||
          Number.parseFloat(style.opacity || "1") < 0.05
        ) {
          return null;
        }

        return {
          area,
          backgroundColor: style.backgroundColor,
          color: style.color,
          fontSize: Number.parseFloat(style.fontSize || "0"),
          fontWeight: Number.parseInt(style.fontWeight || "400", 10) || 400,
          isButton:
            element.matches("button, [role='button'], input[type='button'], input[type='submit']") ||
            (element.matches("a") && /start|try|get|book|demo|contact|sign|buy|join/i.test(text)),
          isNav: Boolean(element.closest("nav, header")),
          rect: {
            bottom: rect.bottom,
            height: rect.height,
            left: rect.left,
            right: rect.right,
            top: rect.top,
            width: rect.width,
          },
          tagName: element.tagName,
          textLength: text.length,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    const firstScreenElements = visibleElements.filter((entry) => entry.rect.top < viewportHeight);
    const heroElements = visibleElements.filter((entry) => entry.rect.top < viewportHeight * 0.62);
    const textElements = visibleElements.filter((entry) => entry.textLength > 0);
    const ctas = visibleElements.filter((entry) => entry.isButton);
    const navItems = visibleElements.filter((entry) => entry.isNav && entry.textLength > 0);
    const sections = Array.from(document.body.querySelectorAll<HTMLElement>("section, main > div, article"))
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.height > 80 && rect.top < viewportHeight * 3)
      .sort((a, b) => a.top - b.top);

    const occupiedArea = firstScreenElements.reduce((sum, entry) => sum + Math.min(entry.area, viewportArea), 0);
    const whitespaceDensity = clamp01(1 - Math.min(occupiedArea / viewportArea, 0.86));

    const leftWeight = firstScreenElements
      .filter((entry) => entry.rect.left + entry.rect.width / 2 < viewportWidth / 2)
      .reduce((sum, entry) => sum + entry.area, 0);
    const rightWeight = firstScreenElements
      .filter((entry) => entry.rect.left + entry.rect.width / 2 >= viewportWidth / 2)
      .reduce((sum, entry) => sum + entry.area, 0);
    const layoutSymmetry = clamp01(1 - Math.abs(leftWeight - rightWeight) / Math.max(leftWeight + rightWeight, 1));

    const largestTextSize = Math.max(...textElements.map((entry) => entry.fontSize), 0);
    const medianTextSize = median(textElements.map((entry) => entry.fontSize).filter(Boolean));
    const hierarchyRatio = medianTextSize ? largestTextSize / medianTextSize : 1;
    const visualHierarchy = clamp01((hierarchyRatio - 1.15) / 2.4);

    const hasHeroHeading = heroElements.some(
      (entry) => /^H[1-2]$/.test(entry.tagName) || (entry.fontSize >= 32 && entry.textLength > 8),
    );
    const heroCoverage = heroElements.reduce((sum, entry) => sum + entry.area, 0) / viewportArea;
    const heroStructure = clamp01((hasHeroHeading ? 0.45 : 0.1) + Math.min(heroCoverage, 0.48));

    const largestCtaArea = Math.max(...ctas.map((entry) => entry.area), 0);
    const ctaProminence = clamp01((largestCtaArea / Math.max(viewportArea * 0.018, 1)) + (ctas.length > 0 ? 0.2 : 0));

    const navigationComplexity = clamp01(navItems.length / (viewportWidth < 600 ? 10 : 18));

    const sectionGaps = sections.slice(1).map((rect, index) => Math.max(0, rect.top - sections[index].bottom));
    const sectionRhythm = sectionGaps.length > 1 ? clamp01(1 - coefficientOfVariation(sectionGaps)) : 0.55;

    const contentDensity = clamp01(firstScreenElements.length / (viewportWidth < 600 ? 120 : 220));

    const contrastSamples = textElements.slice(0, 80).map((entry) =>
      contrastRatio(parseColor(entry.color), parseColor(entry.backgroundColor)),
    );
    const visualContrastDistribution = clamp01((average(contrastSamples) - 1) / 10);

    return {
      whitespaceDensity: roundMetric(whitespaceDensity),
      layoutSymmetry: roundMetric(layoutSymmetry),
      visualHierarchy: roundMetric(visualHierarchy),
      heroStructure: roundMetric(heroStructure),
      ctaProminence: roundMetric(ctaProminence),
      navigationComplexity: roundMetric(navigationComplexity),
      sectionRhythm: roundMetric(sectionRhythm),
      contentDensity: roundMetric(contentDensity),
      visualContrastDistribution: roundMetric(visualContrastDistribution),
      elementCount: firstScreenElements.length,
      navItemCount: navItems.length,
      ctaCount: ctas.length,
      largestTextSize: Math.round(largestTextSize),
    };

    function parseColor(color: string) {
      const match = color.match(/rgba?\(([^)]+)\)/);
      if (!match) {
        return [255, 255, 255];
      }
      return match[1].split(",").slice(0, 3).map((part) => Number.parseFloat(part.trim()));
    }

    function contrastRatio(foreground: number[], background: number[]) {
      const light = Math.max(relativeLuminance(foreground), relativeLuminance(background));
      const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background));
      return (light + 0.05) / (dark + 0.05);
    }

    function relativeLuminance(rgb: number[]) {
      const [red, green, blue] = rgb.map((channel) => {
        const value = channel / 255;
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    }

    function coefficientOfVariation(values: number[]) {
      const mean = average(values);
      if (!mean) {
        return 1;
      }
      const variance = average(values.map((value) => (value - mean) ** 2));
      return Math.sqrt(variance) / mean;
    }

    function average(values: number[]) {
      return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    }

    function median(values: number[]) {
      if (values.length === 0) {
        return 0;
      }
      const sorted = [...values].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length / 2)];
    }

    function clamp01(value: number) {
      return Math.max(0, Math.min(1, value));
    }

    function roundMetric(value: number) {
      return Math.round(clamp01(value) * 100);
    }
  });
}

function buildVisualScores(
  desktop: VisualViewportAnalysis["metrics"],
  mobile: VisualViewportAnalysis["metrics"],
): VisualDnaAnalysis["scores"] {
  const avg = (key: keyof typeof desktop) => Math.round((desktop[key] + mobile[key]) / 2);
  const whitespace = avg("whitespaceDensity");
  const density = avg("contentDensity");
  const contrast = avg("visualContrastDistribution");
  const hierarchy = avg("visualHierarchy");
  const symmetry = avg("layoutSymmetry");
  const rhythm = avg("sectionRhythm");
  const cta = avg("ctaProminence");
  const nav = avg("navigationComplexity");

  return {
    visualBalance: clampScore(Math.round(symmetry * 0.38 + rhythm * 0.28 + (100 - Math.abs(whitespace - 42)) * 0.34)),
    clarity: clampScore(Math.round(contrast * 0.24 + hierarchy * 0.26 + cta * 0.2 + (100 - nav) * 0.15 + (100 - density) * 0.15)),
    visualAggression: clampScore(Math.round((100 - whitespace) * 0.22 + density * 0.2 + cta * 0.18 + nav * 0.14 + hierarchy * 0.14 + contrast * 0.12)),
    minimalism: clampScore(Math.round(whitespace * 0.34 + (100 - density) * 0.26 + (100 - nav) * 0.2 + symmetry * 0.12 + (100 - cta) * 0.08)),
  };
}

function viewportObservations(metrics: RawVisualMetrics) {
  return [
    `Whitespace density reads at ${metrics.whitespaceDensity}/100 with ${metrics.elementCount} visible first-screen elements.`,
    `Layout symmetry scores ${metrics.layoutSymmetry}/100 across the viewport centerline.`,
    `Hierarchy peaks at ${metrics.largestTextSize}px with ${metrics.ctaCount} CTA candidates and ${metrics.navItemCount} navigation text nodes.`,
    `Contrast distribution lands at ${metrics.visualContrastDistribution}/100 from sampled text/background pairs.`,
  ];
}

function buildHierarchyAnalysis(desktop: VisualViewportAnalysis, mobile: VisualViewportAnalysis) {
  return [
    `Desktop hierarchy scores ${desktop.metrics.visualHierarchy}/100; mobile hierarchy scores ${mobile.metrics.visualHierarchy}/100.`,
    `Hero structure is ${desktop.metrics.heroStructure}/100 on desktop and ${mobile.metrics.heroStructure}/100 on mobile.`,
    `CTA prominence shifts from ${desktop.metrics.ctaProminence}/100 desktop to ${mobile.metrics.ctaProminence}/100 mobile.`,
  ];
}

function buildLayoutObservations(desktop: VisualViewportAnalysis, mobile: VisualViewportAnalysis) {
  return [
    `Desktop balance combines ${desktop.metrics.layoutSymmetry}/100 symmetry with ${desktop.metrics.sectionRhythm}/100 section rhythm.`,
    `Mobile density registers ${mobile.metrics.contentDensity}/100 against ${mobile.metrics.whitespaceDensity}/100 whitespace.`,
    `Navigation complexity is ${desktop.metrics.navigationComplexity}/100 desktop and ${mobile.metrics.navigationComplexity}/100 mobile.`,
  ];
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}
