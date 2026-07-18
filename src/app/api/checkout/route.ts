import { NextRequest, NextResponse } from "next/server";
import { lookupVehicle } from "@/lib/autograb";
import { generateReportId, saveReport } from "@/lib/store";
import {
  getBaseUrl,
  getStripe,
  isStripeConfigured,
  REPORT_CURRENCY,
  REPORT_PRICE_CENTS,
} from "@/lib/stripe";
import { AustralianState, VehicleReport } from "@/lib/types";

const STATES: AustralianState[] = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rego = String(body.rego ?? "").trim().toUpperCase();
    const state = String(body.state ?? "").toUpperCase() as AustralianState;

    if (!/^[A-Z0-9]{1,9}$/.test(rego)) {
      return NextResponse.json(
        { error: "Please enter a valid registration plate." },
        { status: 400 }
      );
    }
    if (!STATES.includes(state)) {
      return NextResponse.json(
        { error: "Please select a valid state." },
        { status: 400 }
      );
    }

    const lookup = await lookupVehicle(rego, state);
    const reportId = generateReportId();

    const report: VehicleReport = {
      id: reportId,
      createdAt: new Date().toISOString(),
      status: "pending_payment",
      stripeSessionId: null,
      vehicle: lookup.vehicle,
      registration: lookup.registration,
      valuation: lookup.valuation,
      market: lookup.market,
      ai: lookup.ai,
      damage: null,
    };

    // Demo mode: no Stripe key configured, unlock the report immediately
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
      line_items: [
        {
          price_data: {
            currency: REPORT_CURRENCY,
            unit_amount: REPORT_PRICE_CENTS,
            product_data: {
              name: `Auto Verifi Vehicle Report — ${lookup.vehicle.year} ${lookup.vehicle.make} ${lookup.vehicle.model}`,
              description: `Full history, valuation & AI insights report for ${rego} (${state})`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { reportId },
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
