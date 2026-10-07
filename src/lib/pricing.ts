import type { ReportTier } from "./types";

export type TierHighlight =
  | string
  | {
      text: string;
      accent?: boolean;
    };

export type ReportTierConfig = {
  id: ReportTier;
  name: string;
  priceCents: number;
  stripePriceId?: string;
  tagline: string;
  taglineAccent?: string;
  highlights: TierHighlight[];
};

export const INSIGHTS_PRICE_CENTS = Number(
  process.env.INSIGHTS_PRICE_CENTS ??
    process.env.REPORT_PRICE_CENTS ??
    3500,
);

export const INSIGHTS_PLUS_PRICE_CENTS = Number(
  process.env.INSIGHTS_PLUS_PRICE_CENTS ?? 6500,
);

/**
 * Price to upgrade an already-purchased Insights report to Insights+.
 * Defaults to the difference between the two tiers; override with
 * INSIGHTS_PLUS_UPGRADE_PRICE_CENTS.
 */
export const INSIGHTS_PLUS_UPGRADE_PRICE_CENTS = Number(
  process.env.INSIGHTS_PLUS_UPGRADE_PRICE_CENTS ??
    Math.max(0, INSIGHTS_PLUS_PRICE_CENTS - INSIGHTS_PRICE_CENTS),
);

const CURRENCY = (process.env.REPORT_CURRENCY ?? "aud").toUpperCase();

export const REPORT_TIERS: Record<ReportTier, ReportTierConfig> = {
  insights: {
    id: "insights",
    name: "Auto Verifi Insights Report",
    priceCents: INSIGHTS_PRICE_CENTS,
    stripePriceId: process.env.STRIPE_INSIGHTS_PRICE_ID,
    tagline: "Key Vehicle History Checks and Current Valuation Insights",
    highlights: [
      "PPSR, finance, write-off and stolen vehicle check",
      "Live market insights and Retail vs Trade in Valuation",
      "Safety Recall Data",
      "ANCAP Safety rating",
      "Odometer check",
      "Professional PDF report",
    ],
  },
  insights_plus: {
    id: "insights_plus",
    name: "Auto Verifi Insights+ Report",
    priceCents: INSIGHTS_PLUS_PRICE_CENTS,
    stripePriceId: process.env.STRIPE_INSIGHTS_PLUS_PRICE_ID,
    tagline:
      "Complete vehicle intelligence with AI-powered condition analysis and future value insights",
    highlights: [
      "Everything in Auto Verifi Insights",
      "Predicted future valuation",
      "AI powered condition scan of exterior, tyres and interior to detect any damage",
    ],
  },
};

export function tierStripeDescription(tier: ReportTier): string {
  return getReportTierConfig(tier).highlights.join(" • ");
}

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
