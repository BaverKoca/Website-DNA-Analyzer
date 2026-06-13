import { chromium } from "playwright";
import { extractVisibleElementStyles } from "@/lib/analysis/extractor";
import { buildWebsiteAnalysis } from "@/lib/analysis/pipeline";
import { analyzeVisualDna } from "@/lib/analysis/visual-dna";
import type { WebsiteAnalysis } from "@/types/analysis";

export type PlaywrightAnalysisInput = {
  url: string;
  nodeLimit?: number;
  timeoutMs?: number;
};

export async function analyzeWebsiteWithPlaywright(
  input: PlaywrightAnalysisInput,
): Promise<WebsiteAnalysis> {
  const startedAt = Date.now();
  const analyzedAt = new Date().toISOString();
  const nodeLimit = input.nodeLimit ?? 450;
  const timeoutMs = input.timeoutMs ?? 20000;
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 WebsiteDNAAnalyzer/0.1",
    });

    await page.route("**/*", async (route) => {
      const resourceType = route.request().resourceType();
      if (resourceType === "media" || resourceType === "font") {
        await route.abort();
        return;
      }
      await route.continue();
    });

    page.setDefaultTimeout(timeoutMs);
    const response = await page.goto(input.url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
    if (response && response.status() >= 400) {
      throw new Error(`HTTP ${response.status()} response while loading the page.`);
    }

    try {
      await page.waitForLoadState("networkidle", { timeout: Math.min(timeoutMs, 8000) });
    } catch {
      await page.waitForLoadState("load", { timeout: Math.min(timeoutMs, 8000) }).catch(() => null);
    }

    const extraction = await extractVisibleElementStyles(page, { nodeLimit });
    const visual = await analyzeVisualDna(page, input.url, timeoutMs);

    return buildWebsiteAnalysis({
      url: input.url,
      analyzedAt,
      durationMs: Date.now() - startedAt,
      extraction,
      nodeLimit,
      visual,
    });
  } finally {
    await browser.close();
  }
}
