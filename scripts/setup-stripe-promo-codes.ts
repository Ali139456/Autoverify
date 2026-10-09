/**

 * Creates Stripe coupons + promotion codes AVFREE (100% off) and AVCLUB (10% off).

 * Run once per Stripe account (test or live):

 *

 *   npx tsx scripts/setup-stripe-promo-codes.ts

 *

 * Requires STRIPE_SECRET_KEY (loads .env.local from project root when present).

 */

import { readFileSync, existsSync } from "fs";

import { join } from "path";

import Stripe from "stripe";

import { listKnownPromoCodes, lookupPromoCode } from "../src/lib/promo-codes";



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



async function ensurePromotionCode(

  stripe: Stripe,

  code: string,

  percentOff: number,

): Promise<void> {

  const existing = await stripe.promotionCodes.list({

    code,

    limit: 10,

  });



  const activeMatch = existing.data.find(

    (p) => p.active && p.code.toUpperCase() === code.toUpperCase(),

  );

  if (activeMatch) {

    console.log(`Promotion code ${code} already active (${activeMatch.id}) — skipped.`);

    return;

  }



  const coupon = await stripe.coupons.create({

    percent_off: percentOff,

    duration: "forever",

    name:

      percentOff >= 100

        ? "Auto Verifi AVFREE — 100% off"

        : `Auto Verifi ${code} — ${percentOff}% off`,

  });



  const promo = await stripe.promotionCodes.create({
    promotion: { type: "coupon", coupon: coupon.id },
    code,
  });

  console.log(`Created ${code} (${percentOff}% off): promotion ${promo.id}, coupon ${coupon.id}`);

}



async function main() {

  loadEnvLocal();

  const key = process.env.STRIPE_SECRET_KEY?.trim();

  if (!key) {

    console.error("Set STRIPE_SECRET_KEY (or add it to .env.local) and re-run.");

    process.exit(1);

  }



  const stripe = new Stripe(key);



  for (const code of listKnownPromoCodes()) {

    const def = lookupPromoCode(code);

    if (!def) continue;

    await ensurePromotionCode(stripe, def.code, def.percentOff);

  }



  console.log(

    "\nCodes in app + Stripe (Insights & Insights+, inc. GST):",

  );

  console.log("  AVFREE — 100% off (free report)");

  console.log("  AVCLUB — 10% off");

  console.log(

    "\nTip: Enter the code on the checkout form before Pay, or use “Add promotion code” on Stripe Checkout.",

  );

}



main().catch((err) => {

  console.error(err);

  process.exit(1);

});


