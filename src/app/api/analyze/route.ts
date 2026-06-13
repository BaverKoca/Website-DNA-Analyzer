import { NextResponse } from "next/server";
import { analyzeWebsiteWithPlaywright } from "@/lib/analysis/playwright-analyzer";
import { normalizeWebsiteUrl } from "@/lib/analysis/url-validation";
import type { AnalyzeRequest, AnalyzeResponse } from "@/types/analysis";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  let body: Partial<AnalyzeRequest>;

  try {
    body = (await request.json()) as Partial<AnalyzeRequest>;
  } catch {
    return NextResponse.json<AnalyzeResponse>(
      { ok: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const normalizedUrl = normalizeWebsiteUrl(body.url ?? "");

  if (!normalizedUrl.ok) {
    return NextResponse.json<AnalyzeResponse>(
      { ok: false, error: normalizedUrl.error },
      { status: 400 },
    );
  }

  try {
    const analysis = await analyzeWebsiteWithPlaywright({
      url: normalizedUrl.url,
      nodeLimit: 450,
      timeoutMs: 22000,
    });

    return NextResponse.json<AnalyzeResponse>({
      ok: true,
      analysis,
    });
  } catch (error) {
    const message = analysisErrorMessage(error);
    return NextResponse.json<AnalyzeResponse>(
      {
        ok: false,
        error: message,
      },
      { status: 502 },
    );
  }
}

function analysisErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown analysis error.";
  const lower = message.toLowerCase();

  if (lower.includes("timeout")) {
    return "The website took too long to respond. It may be slow, blocking automation, or overloaded. Try again in a moment.";
  }
  if (lower.includes("net::err_name_not_resolved")) {
    return "That domain could not be resolved. Check the URL and try again.";
  }
  if (lower.includes("net::err_connection_refused") || lower.includes("net::err_connection_closed")) {
    return "The website refused the browser connection. It may be blocking automated audits.";
  }
  if (lower.includes("net::err_cert") || lower.includes("ssl")) {
    return "The website has a certificate issue that prevented analysis.";
  }
  if (lower.includes("403") || lower.includes("blocked")) {
    return "The website appears to block automated browsers. Try again later or test a different URL.";
  }

  return `Unable to analyze this website. ${message}`;
}
