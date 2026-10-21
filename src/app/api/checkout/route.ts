import { NextRequest, NextResponse } from "next/server";
import { lookupVehicle } from "@/lib/autograb";
import { parseAssetCategory } from "@/lib/autograb-catalogue";
import { resolveFutureValue } from "@/lib/report-design";
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
import { isVehicleLookupMismatchError } from "@/lib/vehicle-lookup-errors";
import {
  clampText,
  guardBrowserPost,
  isReasonableEmail,
  readBoundedJson,
} from "@/lib/security";

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
  const blocked = guardBrowserPost(req, "checkout", 20, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const body = (await readBoundedJson(req)) as Record<string, unknown>;
    const rawIdentifier = clampText(body.vin ?? body.rego ?? "", 17).toUpperCase();
    const state = clampText(body.state ?? "", 3).toUpperCase() as AustralianState;
    const tier = parseReportTier(body.tier);
    const tierConfig = getReportTierConfig(tier);
    const promoRaw = clampText(body.promoCode, 64);
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
    const customerEmail = clampText(body.customerEmail, 254).toLowerCase();
    const customerFirstName = clampText(body.customerFirstName, 80);
    const customerLastName = clampText(body.customerLastName, 80);
    const customerPostcode = clampText(body.customerPostcode, 12);
    const customerBirthDate = clampText(body.customerBirthDate, 32);
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

    if (customerEmail && !isReasonableEmail(customerEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
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

    const category = parseAssetCategory(
      clampText(body.category, 32) || undefined,
    );
    const catalogueVehicleId = clampText(body.catalogueVehicleId, 32);

    const lookup = await lookupVehicle(
      parsed.value,
      parsed.kind === "rego" ? state : STATES.includes(state) ? state : undefined,
      {
        customerOdometer:
          Number.isFinite(customerOdometer) && customerOdometer > 0
            ? customerOdometer
            : null,
        listingPrice,
        category,
        catalogueVehicleId: catalogueVehicleId || undefined,
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
      manufacturerWarrantyService: lookup.manufacturerWarrantyService ?? null,
      damage: null,
    };
    report.futureValue = resolveFutureValue(report);

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
    if (err instanceof Error && err.message === "PAYLOAD_TOO_LARGE") {
      return NextResponse.json({ error: "Request too large." }, { status: 413 });
    }
    if (isVehicleLookupMismatchError(err)) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const message =
      err instanceof Error ? err.message : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
