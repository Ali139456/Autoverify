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

export function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.VERCEL_URL?.replace(/^/, "https://") ??
    "http://localhost:3000"
  );
}
