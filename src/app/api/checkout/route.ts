import { NextRequest, NextResponse } from "next/server";
import { lookupVehicle } from "@/lib/autograb";
import {
  getReportTierConfig,
  parseReportTier,
} from "@/lib/pricing";
import { generateReportId, saveReport } from "@/lib/store";
import {
  getBaseUrl,
  getStripe,
  isStripeConfigured,
  REPORT_CURRENCY,
} from "@/lib/stripe";
import { AustralianState, ReportTier, VehicleReport } from "@/lib/types";

const STATES: AustralianState[] = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

function buildStripeLineItem(tier: ReportTier, vehicleLabel: string, rego: string, state: string) {
  const config = getReportTierConfig(tier);

  if (config.stripePriceId) {
    return { price: config.stripePriceId, quantity: 1 };
  }

  return {
    price_data: {
      currency: REPORT_CURRENCY,
      unit_amount: config.priceCents,
      product_data: {
        name: `${config.name} — ${vehicleLabel}`,
        description: `Vehicle report for ${rego} (${state})`,
      },
    },
    quantity: 1,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rego = String(body.rego ?? "").trim().toUpperCase();
    const state = String(body.state ?? "").toUpperCase() as AustralianState;
    const tier = parseReportTier(body.tier);

    if (!/^[A-Z0-9]{1,9}$/.test(rego)) {
      return NextResponse.json(
        { error: "Please enter a valid registration plate." },
        { status: 400 },
      );
    }
    if (!STATES.includes(state)) {
      return NextResponse.json(
        { error: "Please select a valid state." },
        { status: 400 },
      );
    }

    const lookup = await lookupVehicle(rego, state);
    const reportId = generateReportId();
    const vehicleLabel = `${lookup.vehicle.year} ${lookup.vehicle.make} ${lookup.vehicle.model}`;

    const report: VehicleReport = {
      id: reportId,
      createdAt: new Date().toISOString(),
      status: "pending_payment",
      tier,
      stripeSessionId: null,
      vehicle: lookup.vehicle,
      registration: lookup.registration,
      valuation: lookup.valuation,
      market: lookup.market,
      ai: lookup.ai,
      damage: null,
    };

    if (!isStripeConfigured()) {
      report.status = "paid";
      await saveReport(report);
      return NextResponse.json({ url: `/report/${reportId}`, demo: true });
    }

    const stripe = getStripe();
    const baseUrl = getBaseUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [buildStripeLineItem(tier, vehicleLabel, rego, state)],
      metadata: { reportId, tier },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&report_id=${reportId}`,
      cancel_url: `${baseUrl}/check?rego=${encodeURIComponent(rego)}&state=${state}&cancelled=1`,
    });

    report.stripeSessionId = session.id;
    await saveReport(report);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
