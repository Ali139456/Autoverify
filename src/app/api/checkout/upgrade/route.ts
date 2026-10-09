import { NextRequest, NextResponse } from "next/server";
import { sendPurchaseConfirmationEmail } from "@/lib/email";
import { normalizeAuMobile } from "@/lib/phone";
import {
  INSIGHTS_PLUS_UPGRADE_PRICE_CENTS,
  resolveReportTier,
} from "@/lib/pricing";
import { applyPercentDiscount, lookupPromoCode } from "@/lib/promo-codes";
import { generateReportId, getReport, saveReport } from "@/lib/store";
import {
  getBaseUrl,
  getStripe,
  isStripeConfigured,
  REPORT_CURRENCY,
} from "@/lib/stripe";
import type { VehicleReport } from "@/lib/types";

/**
 * Upgrade a purchased Insights report to Insights+ without re-entering customer
 * details. Creates a new Insights+ report that copies the source report's vehicle
 * data and customer fields, then takes payment for the upgrade amount only.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sourceReportId = String(body.reportId ?? "").trim();
    if (!sourceReportId) {
      return NextResponse.json({ error: "Report ID is required." }, { status: 400 });
    }

    const source = await getReport(sourceReportId);
    if (!source || source.status !== "paid") {
      return NextResponse.json(
        { error: "We couldn't find a purchased report to upgrade." },
        { status: 404 },
      );
    }
    if (resolveReportTier(source.tier) === "insights_plus") {
      return NextResponse.json(
        { error: "This report already includes Auto Verifi Insights+." },
        { status: 400 },
      );
    }

    if (body.agreedTerms !== true) {
      return NextResponse.json(
        { error: "You must agree to the terms and conditions before purchasing." },
        { status: 400 },
      );
    }

    const customerPhone = normalizeAuMobile(String(body.customerPhone ?? ""));
    const ownerPhone = normalizeAuMobile(String(body.ownerPhone ?? ""));
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

    const promoRaw = String(body.promoCode ?? "");
    const promo = lookupPromoCode(promoRaw);
    if (promoRaw.trim() && !promo) {
      return NextResponse.json(
        { error: "That discount code is not valid." },
        { status: 400 },
      );
    }
    const listPriceCents = INSIGHTS_PLUS_UPGRADE_PRICE_CENTS;
    const unitAmountCents = promo
      ? applyPercentDiscount(listPriceCents, promo.percentOff)
      : listPriceCents;

    const reportId = generateReportId();
    const report: VehicleReport = {
      ...source,
      id: reportId,
      createdAt: new Date().toISOString(),
      status: "pending_payment",
      tier: "insights_plus",
      customerPhone,
      ownerPhone,
      upgradedFromReportId: source.id,
      stripeSessionId: null,
      damage: null,
    };

    const baseUrl = getBaseUrl();
    const customerEmail = source.customerEmail?.trim().toLowerCase() || "";

    if (!isStripeConfigured()) {
      report.status = "paid";
      await saveReport(report);
      return NextResponse.json({ url: `/report/${reportId}`, demo: true });
    }

    if (unitAmountCents <= 0) {
      report.status = "paid";
      await saveReport(report);
      if (customerEmail) {
        await sendPurchaseConfirmationEmail(report, customerEmail, {
          emailContext: {
            reportUrl: `${baseUrl}/report/${reportId}`,
            pdfUrl: `${baseUrl}/api/report/${reportId}/pdf`,
            amountPaidCents: 0,
            currency: REPORT_CURRENCY,
            paidAt: new Date(),
          },
        }).catch(() => null);
      }
      return NextResponse.json({ url: `/report/${reportId}` });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: REPORT_CURRENCY,
            unit_amount: unitAmountCents,
            product_data: {
              name: "Upgrade to Auto Verifi Insights+",
            },
          },
          quantity: 1,
        },
      ],
      allow_promotion_codes: !promo,
      metadata: {
        reportId,
        tier: "insights_plus",
        upgradedFromReportId: source.id,
        promoCode: promo?.code ?? "",
        listPriceCents: String(listPriceCents),
        amountCents: String(unitAmountCents),
      },
      customer_email: customerEmail || undefined,
      invoice_creation: { enabled: true },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&report_id=${reportId}`,
      cancel_url: `${baseUrl}/report/${source.id}`,
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
