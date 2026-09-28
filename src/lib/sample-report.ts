import type { ReportTier } from "./types";

const DEFAULT_HREFS: Record<ReportTier, string> = {
  insights: "/sample-report",
  insights_plus: "/sample-report/insights-plus",
};

/** Public sample report URL (env override or built-in demo pages). */
export function getSampleReportHref(tier: ReportTier = "insights"): string {
  const fromEnv =
    tier === "insights_plus"
      ? process.env.NEXT_PUBLIC_SAMPLE_INSIGHTS_PLUS_REPORT_URL?.trim()
      : process.env.NEXT_PUBLIC_SAMPLE_INSIGHTS_REPORT_URL?.trim();
  return fromEnv || DEFAULT_HREFS[tier];
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
