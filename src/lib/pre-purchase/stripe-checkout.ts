import {
  getBaseUrl,
  getStripe,
  isStripeConfigured,
  REPORT_CURRENCY,
} from "@/lib/stripe";
import type { PrePurchaseBookingPayload } from "./types";

export async function createPrePurchaseStripeCheckoutSession(
  payload: PrePurchaseBookingPayload,
): Promise<string | null> {
  if (!isStripeConfigured()) return null;

  const stripe = getStripe();
  const baseUrl = getBaseUrl();
  const unitCents = Math.round(payload.priceIncGst * 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: REPORT_CURRENCY,
          unit_amount: unitCents,
          product_data: {
            name: "Pre-purchase vehicle inspection",
          },
        },
        quantity: 1,
      },
    ],
    allow_promotion_codes: !payload.promoCode,
    customer_email: payload.contactEmail,
    invoice_creation: { enabled: true },
    metadata: {
      ppiBookingRef: payload.bookingRef,
      ppiPromoCode: payload.promoCode.slice(0, 64),
      ppiContactName: payload.contactName.slice(0, 500),
      ppiContactPhone: payload.contactPhone.slice(0, 500),
      ppiSuburb: `${payload.suburb} NSW ${payload.postcode}`.slice(0, 500),
      ppiVehicle: `${payload.vehicleYear} ${payload.vehicleMake} ${payload.vehicleModel}`.slice(
        0,
        500,
      ),
      ppiRego: `${payload.vehicleRego} ${payload.vehicleState}`.slice(0, 500),
      ppiWhen: payload.preferredWhen.slice(0, 500),
      ppiAddress: payload.addressLine.slice(0, 500),
      ppiAccess: payload.accessNotes.slice(0, 500),
      ppiVin: payload.vehicleVin.slice(0, 500),
    },
    success_url: `${baseUrl}/inspections/pre-purchase/booking/success?ref=${encodeURIComponent(payload.bookingRef)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/inspections/pre-purchase#book`,
  });

  return session.url;
}
