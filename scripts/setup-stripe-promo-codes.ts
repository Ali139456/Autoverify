/**
 * Creates Stripe coupons + promotion codes AVFREE and AVCLUB (10% off, both tiers).
 * Requires STRIPE_SECRET_KEY in the environment.
 *
 *   npx tsx scripts/setup-stripe-promo-codes.ts
 */
import Stripe from "stripe";
import { listKnownPromoCodes } from "../src/lib/promo-codes";

const PERCENT_OFF = 10;

async function main() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    console.error("Set STRIPE_SECRET_KEY before running this script.");
    process.exit(1);
  }

  const stripe = new Stripe(key);
  const coupon = await stripe.coupons.create({
    percent_off: PERCENT_OFF,
    duration: "forever",
    name: `Auto Verifi ${PERCENT_OFF}% off (Insights & Insights+)`,
  });

  console.log(`Coupon created: ${coupon.id}`);

  for (const code of listKnownPromoCodes()) {
    const existing = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
    });
    if (existing.data.length > 0) {
      console.log(`Promotion code ${code} already exists — skipped.`);
      continue;
    }

    const promo = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code,
    });
    console.log(`Promotion code ${code}: ${promo.id}`);
  }

  console.log(
    "\nCheckout uses dynamic line-item prices; these codes are for Stripe-hosted promotion entry when allow_promotion_codes is enabled.",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
