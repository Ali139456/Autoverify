import { getBaseUrl, getStripe, isStripeConfigured, REPORT_CURRENCY } from "@/lib/stripe";
import type { LavBookingPayload } from "./types";
import { updateLavBooking } from "./booking-store";

function unitAmountIncGstCents(inspectionType: string): number {
  if (inspectionType.toLowerCase().includes("digital")) {
    return 3850;
  }
  return 13200;
}

export async function createLavStripeCheckoutSession(
  payload: LavBookingPayload,
): Promise<string | null> {
  if (!isStripeConfigured()) return null;

  const stripe = getStripe();
  const baseUrl = getBaseUrl();
  const unitCents = unitAmountIncGstCents(payload.inspectionType);
  const productName = payload.inspectionType.startsWith("Digital")
    ? "Lender asset verification — Digital Self Inspection"
    : "Lender asset verification — Physical inspection";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: REPORT_CURRENCY,
          unit_amount: unitCents,
          product_data: { name: productName },
        },
        quantity: payload.assets.length,
      },
    ],
    customer_email: payload.contactEmail || undefined,
    invoice_creation: { enabled: true },
    metadata: {
      lavBookingRef: payload.bookingRef,
      inspectionType: payload.inspectionType.slice(0, 80),
      assetCount: String(payload.assets.length),
    },
    success_url: `${baseUrl}/inspections/lender-asset-verification/booking/success?ref=${encodeURIComponent(payload.bookingRef)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/inspections/lender-asset-verification#book`,
  });

  await updateLavBooking(payload.bookingRef, {
    stripeSessionId: session.id,
  });

  return session.url;
}
