/**
 * Creates $35 / $65 AUD prices on existing Stripe catalog products and deactivates
 * older active prices. Prints Price IDs for Vercel env vars.
 *
 *   npx tsx scripts/update-stripe-product-prices.ts
 *
 * Requires STRIPE_SECRET_KEY (loads .env.local from project root when present).
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import Stripe from "stripe";
import {
  INSIGHTS_PLUS_PRICE_CENTS,
  INSIGHTS_PRICE_CENTS,
} from "../src/lib/pricing";

function loadEnvLocal() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const PRODUCT_NAMES = {
  insights: "Auto Verifi Insights",
  insights_plus: "Auto Verifi Insights+",
} as const;

async function findProduct(
  stripe: Stripe,
  name: string,
): Promise<Stripe.Product | null> {
  let startingAfter: string | undefined;
  for (;;) {
    const page = await stripe.products.list({
      active: true,
      limit: 100,
      starting_after: startingAfter,
    });
    const match = page.data.find((p) => p.name === name);
    if (match) return match;
    if (!page.has_more) break;
    startingAfter = page.data[page.data.length - 1]?.id;
  }
  return null;
}

async function replaceProductPrice(
  stripe: Stripe,
  product: Stripe.Product,
  unitAmountCents: number,
): Promise<string> {
  const existing = await stripe.prices.list({
    product: product.id,
    active: true,
    limit: 100,
  });

  const template = existing.data[0];
  const newPrice = await stripe.prices.create({
    product: product.id,
    currency: "aud",
    unit_amount: unitAmountCents,
    tax_behavior: template?.tax_behavior ?? "inclusive",
  });

  await stripe.products.update(product.id, {
    default_price: newPrice.id,
  });

  for (const price of existing.data) {
    if (price.id === newPrice.id) continue;
    await stripe.prices.update(price.id, { active: false });
  }

  return newPrice.id;
}

async function main() {
  loadEnvLocal();
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    console.error("Set STRIPE_SECRET_KEY (or add it to .env.local) and re-run.");
    process.exit(1);
  }

  const stripe = new Stripe(key);
  const insightsProduct = await findProduct(
    stripe,
    PRODUCT_NAMES.insights,
  );
  const plusProduct = await findProduct(
    stripe,
    PRODUCT_NAMES.insights_plus,
  );

  if (!insightsProduct || !plusProduct) {
    console.error(
      "Could not find both catalog products. Expected names:",
      PRODUCT_NAMES,
    );
    process.exit(1);
  }

  const insightsPriceId = await replaceProductPrice(
    stripe,
    insightsProduct,
    INSIGHTS_PRICE_CENTS,
  );
  const plusPriceId = await replaceProductPrice(
    stripe,
    plusProduct,
    INSIGHTS_PLUS_PRICE_CENTS,
  );

  console.log("\nStripe catalog updated.");
  console.log(
    `  ${PRODUCT_NAMES.insights}: $${INSIGHTS_PRICE_CENTS / 100} AUD → price ${insightsPriceId}`,
  );
  console.log(
    `  ${PRODUCT_NAMES.insights_plus}: $${INSIGHTS_PLUS_PRICE_CENTS / 100} AUD → price ${plusPriceId}`,
  );
  console.log("\nAdd to Vercel / .env.local:");
  console.log(`STRIPE_INSIGHTS_PRICE_ID=${insightsPriceId}`);
  console.log(`STRIPE_INSIGHTS_PLUS_PRICE_ID=${plusPriceId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
