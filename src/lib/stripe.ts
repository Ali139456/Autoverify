import Stripe from "stripe";
import {
  formatTierPrice,
  INSIGHTS_PRICE_CENTS,
} from "./pricing";

export { formatTierPrice, formatCents, INSIGHTS_PRICE_CENTS } from "./pricing";
export type { ReportTier } from "./types";

/** @deprecated Use INSIGHTS_PRICE_CENTS */
export const REPORT_PRICE_CENTS = INSIGHTS_PRICE_CENTS;
export const REPORT_CURRENCY = process.env.REPORT_CURRENCY ?? "aud";

export function formatPrice(): string {
  return formatTierPrice("insights");
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

const PRODUCTION_BASE_URL = "https://www.autoverifi.com.au";

export function getBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (configured) return configured;

  // Never send Stripe redirects to ephemeral *.vercel.app deployment URLs.
  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_BASE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
