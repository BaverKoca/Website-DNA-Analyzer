"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { AnalysisResults } from "@/components/analysis-results";
import { CompareForm } from "@/components/compare-form";
import { CompareResults } from "@/components/compare-results";
import { LandingHero } from "@/components/landing-hero";
import { UrlAnalyzeForm } from "@/components/url-analyze-form";
import { normalizeWebsiteUrl } from "@/lib/analysis/url-validation";
import type { AnalyzeResponse, WebsiteAnalysis } from "@/types/analysis";

type AnalysisState =
  | { status: "idle"; data: null; error: null }
  | { status: "loading"; data: WebsiteAnalysis | null; error: null }
  | { status: "success"; data: WebsiteAnalysis; error: null }
  | { status: "error"; data: WebsiteAnalysis | null; error: string };

type AppMode = "analyze" | "compare";

type CompareState =
  | { status: "idle"; data: null; error: null }
  | { status: "loading"; data: { left: WebsiteAnalysis; right: WebsiteAnalysis } | null; error: null }
  | { status: "success"; data: { left: WebsiteAnalysis; right: WebsiteAnalysis }; error: null }
  | { status: "error"; data: { left: WebsiteAnalysis; right: WebsiteAnalysis } | null; error: string };

const sampleUrls = ["linear.app", "vercel.com", "stripe.com", "apple.com"];
const progressStages = [
  "Connecting",
  "Capturing layout",
  "Extracting design tokens",
  "Analyzing visual DNA",
  "Generating report",
];

export function AnalyzerDashboard() {
  const [mode, setMode] = useState<AppMode>("analyze");
  const [url, setUrl] = useState("linear.app");
  const [leftUrl, setLeftUrl] = useState("linear.app");
  const [rightUrl, setRightUrl] = useState("vercel.com");
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    status: "idle",
    data: null,
    error: null,
  });
  const [compareState, setCompareState] = useState<CompareState>({
    status: "idle",
    data: null,
    error: null,
  });
  const [progressStage, setProgressStage] = useState(progressStages[0]);
  const analysisCache = useRef(new Map<string, WebsiteAnalysis>());

  const hasResults = analysisState.status === "success" && analysisState.data;
  const hasComparison = compareState.status === "success" && compareState.data;
  const eyebrow = useMemo(() => {
    if (mode === "compare") {
      if (compareState.status === "loading") {
        return "Running paired analysis";
      }
      if (hasComparison) {
        return "Comparison complete";
      }
      return "Compare mode";
    }
    if (hasResults) {
      return "Extraction complete";
    }
    if (analysisState.status === "loading") {
      return "Scanning visual surface";
    }
    return "Live extraction engine";
  }, [analysisState.status, compareState.status, hasComparison, hasResults, mode]);

  async function analyzeUrl(targetUrl: string) {
    const normalized = normalizeWebsiteUrl(targetUrl);
    if (!normalized.ok) {
      throw new Error(normalized.error);
    }

    const cacheKey = normalizeCacheKey(normalized.url);
    const cached = analysisCache.current.get(cacheKey);
    if (cached) {
      setProgressStage("Generating report");
      return cached;
    }

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: normalized.url }),
    });
    const payload = (await response.json()) as AnalyzeResponse;

    if (!payload.ok) {
      throw new Error(payload.error);
    }

    analysisCache.current.set(cacheKey, payload.analysis);
    return payload.analysis;
  }

  async function runWithProgress<T>(task: () => Promise<T>) {
    let stageIndex = 0;
    setProgressStage(progressStages[stageIndex]);
    const timer = window.setInterval(() => {
      stageIndex = Math.min(stageIndex + 1, progressStages.length - 1);
      setProgressStage(progressStages[stageIndex]);
    }, 1800);

    try {
      const result = await task();
      setProgressStage(progressStages[progressStages.length - 1]);
      return result;
    } finally {
      window.clearInterval(timer);
    }
  }

  async function runSingleAnalysis() {
    setAnalysisState((current) => ({
      status: "loading",
      data: current.data,
      error: null,
    }));

    try {
      const analysis = await runWithProgress(() => analyzeUrl(url));

      setAnalysisState({
        status: "success",
        data: analysis,
        error: null,
      });
    } catch (error) {
      setAnalysisState((current) => ({
        status: "error",
        data: current.data,
        error: error instanceof Error ? error.message : "Analysis service is unavailable.",
      }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runSingleAnalysis();
  }

  async function runComparisonAnalysis() {
    setCompareState((current) => ({
      status: "loading",
      data: current.data,
      error: null,
    }));

    try {
      const [left, right] = await runWithProgress(() =>
        Promise.all([analyzeUrl(leftUrl), analyzeUrl(rightUrl)]),
      );
      setCompareState({
        status: "success",
        data: { left, right },
        error: null,
      });
    } catch (error) {
      setCompareState((current) => ({
        status: "error",
        data: current.data,
        error: error instanceof Error ? error.message : "Comparison analysis is unavailable.",
      }));
    }
  }

  async function handleCompareSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runComparisonAnalysis();
  }

  return (
    <main className="min-h-screen overflow-hidden px-5 py-5 text-bone sm:px-7 lg:px-10">
      <LandingHero />

      <div
        className={`mx-auto flex min-h-[calc(100vh-40px)] w-full flex-col border border-line bg-ink/70 shadow-glow backdrop-blur ${
          mode === "compare" ? "max-w-[1600px]" : "max-w-7xl"
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-fog">
            Analyzer console
          </div>
          <div className="hidden items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-fog sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            Playwright-ready
          </div>
        </header>

        <section
          className={`grid flex-1 grid-cols-1 ${
            mode === "compare"
              ? "xl:grid-cols-[380px_minmax(0,1fr)]"
              : "lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]"
          }`}
        >
          <div className="flex flex-col justify-between border-b border-line p-5 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.32em] text-ember">{eyebrow}</p>
              <h1
                className={`mt-8 max-w-3xl font-editorial leading-[0.92] text-bone ${
                  mode === "compare" ? "text-5xl sm:text-6xl" : "text-6xl sm:text-7xl lg:text-8xl"
                }`}
              >
                {mode === "compare"
                  ? "Compare two design systems side by side."
                  : "Decode the visual intelligence of any website."}
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-fog sm:text-lg">
                {mode === "compare"
                  ? "Run a paired audit across culture, maturity, visual clarity, token systems, screenshots, and product discipline."
                  : "Run a single-site audit across extracted tokens, Visual DNA, classifier verdicts, and exportable report output."}
              </p>
            </div>

            <div>
              <div className="mt-10 inline-grid grid-cols-2 border border-line p-1">
                {(["analyze", "compare"] as const).map((item) => (
                  <button
                    aria-pressed={mode === item}
                    className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] transition focus:ring-2 focus:ring-ember/40 ${
                      mode === item ? "bg-bone text-ink" : "text-fog hover:text-bone"
                    }`}
                    key={item}
                    onClick={() => setMode(item)}
                    type="button"
                  >
                    {item === "analyze" ? "Analyze" : "Compare"}
                  </button>
                ))}
              </div>

              {mode === "compare" ? (
                <CompareForm
                  error={compareState.status === "error" ? compareState.error : null}
                  isLoading={compareState.status === "loading"}
                  leftUrl={leftUrl}
                  onSubmit={handleCompareSubmit}
                  rightUrl={rightUrl}
                  sampleUrls={sampleUrls}
                  setLeftUrl={setLeftUrl}
                  setRightUrl={setRightUrl}
                />
              ) : (
                <UrlAnalyzeForm
                  error={analysisState.status === "error" ? analysisState.error : null}
                  isLoading={analysisState.status === "loading"}
                  onSubmit={handleSubmit}
                  sampleUrls={sampleUrls}
                  setUrl={setUrl}
                  url={url}
                />
              )}
            </div>
          </div>

          {mode === "compare" ? (
            hasComparison ? (
              <CompareResults left={compareState.data.left} right={compareState.data.right} />
            ) : (
              <AnalysisResults
                analysis={null}
                error={compareState.status === "error" ? compareState.error : null}
                isLoading={compareState.status === "loading"}
                onRetry={() => {
                  void runComparisonAnalysis();
                }}
                progressStage={progressStage}
              />
            )
          ) : (
            <AnalysisResults
              analysis={hasResults ? analysisState.data : null}
              error={analysisState.status === "error" ? analysisState.error : null}
              isLoading={analysisState.status === "loading"}
              onRetry={() => {
                void runSingleAnalysis();
              }}
              progressStage={progressStage}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function normalizeCacheKey(url: string) {
  return url.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "").toLowerCase();
}
