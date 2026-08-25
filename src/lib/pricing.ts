import type { ReportTier } from "./types";

export type ReportTierConfig = {
  id: ReportTier;
  name: string;
  priceCents: number;
  stripePriceId?: string;
  tagline: string;
  highlights: string[];
};

export const INSIGHTS_PRICE_CENTS = Number(
  process.env.INSIGHTS_PRICE_CENTS ??
    process.env.REPORT_PRICE_CENTS ??
    3900,
);

export const INSIGHTS_PLUS_PRICE_CENTS = Number(
  process.env.INSIGHTS_PLUS_PRICE_CENTS ?? 8900,
);

const CURRENCY = (process.env.REPORT_CURRENCY ?? "aud").toUpperCase();

export const REPORT_TIERS: Record<ReportTier, ReportTierConfig> = {
  insights: {
    id: "insights",
    name: "Auto Verifi Insights",
    priceCents: INSIGHTS_PRICE_CENTS,
    stripePriceId: process.env.STRIPE_INSIGHTS_PRICE_ID,
    tagline: "Key Vehicle History Checks and Current Valuation Insights",
    highlights: [
      "PPSR, finance, write-off & stolen checks",
      "Live market insights and Retail vs Trade in Valuation",
      "AI risk score & depreciation forecast",
      "Professional PDF report",
    ],
  },
  insights_plus: {
    id: "insights_plus",
    name: "Auto Verifi Insights+",
    priceCents: INSIGHTS_PLUS_PRICE_CENTS,
    stripePriceId: process.env.STRIPE_INSIGHTS_PLUS_PRICE_ID,
    tagline: "Everything in Insights, plus AI photo damage analysis.",
    highlights: [
      "Everything in Auto Verifi Insights",
      "Ravin AI mobile photo inspection",
      "Panel damage detection & repair estimates",
      "Guided 13-angle walkaround",
    ],
  },
};

export const REPORT_TIER_ORDER: ReportTier[] = ["insights", "insights_plus"];

export function parseReportTier(value: unknown): ReportTier {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");

  if (
    normalized === "insights_plus" ||
    normalized === "plus" ||
    normalized === "insights+"
  ) {
    return "insights_plus";
  }

  return "insights";
}

export function getReportTierConfig(tier: ReportTier): ReportTierConfig {
  return REPORT_TIERS[tier];
}

export function formatTierPrice(tier: ReportTier): string {
  return formatCents(getReportTierConfig(tier).priceCents);
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function hasDamageAnalysis(tier: ReportTier | undefined): boolean {
  return (tier ?? "insights_plus") === "insights_plus";
}

export function resolveReportTier(tier: ReportTier | undefined): ReportTier {
  return tier ?? "insights_plus";
}
