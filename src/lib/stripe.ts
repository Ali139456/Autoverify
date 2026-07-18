import Stripe from "stripe";

export const REPORT_PRICE_CENTS = Number(
  process.env.REPORT_PRICE_CENTS ?? 3495
);
export const REPORT_CURRENCY = process.env.REPORT_CURRENCY ?? "aud";

export function formatPrice(): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: REPORT_CURRENCY.toUpperCase(),
  }).format(REPORT_PRICE_CENTS / 100);
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
