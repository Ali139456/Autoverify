import { NextRequest, NextResponse } from "next/server";
import { lookupVehicle } from "@/lib/autograb";
import {
  getReportTierConfig,
  hasDamageAnalysis,
  parseReportTier,
} from "@/lib/pricing";
import { applyPercentDiscount, lookupPromoCode } from "@/lib/promo-codes";
import { sendPurchaseConfirmationEmail } from "@/lib/email";
import { generateReportId, saveReport } from "@/lib/store";
import {
  getBaseUrl,
  getStripe,
  isStripeConfigured,
  REPORT_CURRENCY,
} from "@/lib/stripe";
import { normalizeAuMobile } from "@/lib/phone";
import { AustralianState, ReportTier, VehicleReport } from "@/lib/types";
import { parseVehicleIdentifier } from "@/lib/vehicle-identifier";

const STATES: AustralianState[] = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

function buildStripeLineItem(tier: ReportTier, unitAmountCents: number) {
  const productName =
    tier === "insights_plus"
      ? "Auto Verifi Insights+"
      : "Auto Verifi Insights";

  return {
    price_data: {
      currency: REPORT_CURRENCY,
      unit_amount: unitAmountCents,
      product_data: {
        name: productName,
      },
    },
    quantity: 1,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawIdentifier = String(body.vin ?? body.rego ?? "")
      .trim()
      .toUpperCase();
    const state = String(body.state ?? "").toUpperCase() as AustralianState;
    const tier = parseReportTier(body.tier);
    const tierConfig = getReportTierConfig(tier);
    const promoRaw = String(body.promoCode ?? "");
    const promo = lookupPromoCode(promoRaw);
    if (promoRaw.trim() && !promo) {
      return NextResponse.json(
        { error: "That discount code is not valid." },
        { status: 400 },
      );
    }
    const unitAmountCents = promo
      ? applyPercentDiscount(tierConfig.priceCents, promo.percentOff)
      : tierConfig.priceCents;
    const requiresPhones = hasDamageAnalysis(tier);
    const agreedTerms = body.agreedTerms === true;
    if (!agreedTerms) {
      return NextResponse.json(
        { error: "You must agree to the terms and conditions before purchasing." },
        { status: 400 },
      );
    }
    const marketingOptIn = body.marketingOptIn === true;
    const customerEmail = String(body.customerEmail ?? "").trim().toLowerCase();
    const customerFirstName = String(body.customerFirstName ?? "").trim();
    const customerLastName = String(body.customerLastName ?? "").trim();
    const customerPostcode = String(body.customerPostcode ?? "").trim();
    const customerBirthDate = String(body.customerBirthDate ?? "").trim();
    const customerOdometer = Number(body.customerOdometer);
    const advertisedPrice = Number(body.advertisedPrice);
    const customerPhone = normalizeAuMobile(String(body.customerPhone ?? ""));
    const ownerPhone = normalizeAuMobile(String(body.ownerPhone ?? ""));

    const parsed = parseVehicleIdentifier(rawIdentifier);
    if (!parsed) {
      return NextResponse.json(
        { error: "Please enter a valid registration plate or 17-character VIN." },
        { status: 400 },
      );
    }
    if (parsed.kind === "rego" && !STATES.includes(state)) {
      return NextResponse.json(
        { error: "Please select a valid state." },
        { status: 400 },
      );
    }

    if (requiresPhones) {
      if (!customerPhone) {
        return NextResponse.json(
          { error: "Please enter a valid customer mobile number." },
          { status: 400 },
        );
      }
      if (!ownerPhone) {
        return NextResponse.json(
          { error: "Please enter a valid vehicle owner mobile number." },
          { status: 400 },
        );
      }
    }

    const listingPrice =
      Number.isFinite(advertisedPrice) && advertisedPrice > 0
        ? advertisedPrice
        : null;

    const lookup = await lookupVehicle(
      parsed.value,
      parsed.kind === "rego" ? state : STATES.includes(state) ? state : undefined,
      {
        customerOdometer:
          Number.isFinite(customerOdometer) && customerOdometer > 0
            ? customerOdometer
            : null,
        listingPrice,
      },
    );
    const reportId = generateReportId();

    const report: VehicleReport = {
      id: reportId,
      createdAt: new Date().toISOString(),
      status: "pending_payment",
      tier,
      customerEmail: customerEmail || null,
      customerFirstName: customerFirstName || null,
      customerLastName: customerLastName || null,
      customerPostcode: customerPostcode || null,
      customerBirthDate: customerBirthDate || null,
      advertisedPrice:
        Number.isFinite(advertisedPrice) && advertisedPrice > 0
          ? advertisedPrice
          : null,
      customerPhone: customerPhone ?? null,
      ownerPhone: ownerPhone ?? null,
      stripeSessionId: null,
      vehicle: lookup.vehicle,
      registration: lookup.registration,
      valuation: lookup.valuation,
      futureValue: lookup.futureValue,
      market: lookup.market,
      ai: lookup.ai,
      vehicleSpec: lookup.vehicleSpec,
      damage: null,
    };

    if (!isStripeConfigured()) {
      report.status = "paid";
      await saveReport(report);
      return NextResponse.json({ url: `/report/${reportId}`, demo: true });
    }

    if (unitAmountCents <= 0) {
      report.status = "paid";
      await saveReport(report);
      const baseUrl = getBaseUrl();
      if (customerEmail) {
        await sendPurchaseConfirmationEmail(report, customerEmail, {
          emailContext: {
            reportUrl: `${baseUrl}/report/${reportId}`,
            pdfUrl: `${baseUrl}/api/report/${reportId}/pdf`,
            amountPaidCents: unitAmountCents,
            listPriceCents: tierConfig.priceCents,
            promoCode: promo?.code ?? null,
            currency: REPORT_CURRENCY,
            paidAt: new Date(),
          },
        }).catch(() => null);
      }
      return NextResponse.json({ url: `/report/${reportId}` });
    }

    const stripe = getStripe();
    const baseUrl = getBaseUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        buildStripeLineItem(tier, unitAmountCents),
      ],
      allow_promotion_codes: !promo,
      metadata: {
        reportId,
        tier,
        marketingOptIn: marketingOptIn ? "yes" : "no",
        promoCode: promo?.code ?? "",
        listPriceCents: String(tierConfig.priceCents),
        amountCents: String(unitAmountCents),
      },
      customer_email: customerEmail || undefined,
      invoice_creation: { enabled: true },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&report_id=${reportId}`,
      cancel_url: `${baseUrl}/`,
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
