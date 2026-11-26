import {
  getBaseUrl,
  getStripe,
  isStripeConfigured,
  REPORT_CURRENCY,
} from "@/lib/stripe";
import { PPI_CUSTOMER_BOOKING_HEADING } from "./constants";
import type { PrePurchaseBookingPayload } from "./types";

const PPI_CHECKOUT_CANCEL_PATHS = new Set([
  "/inspections/pre-purchase",
  "/sydneyprepurchase",
]);

function resolvePpiCancelUrl(
  baseUrl: string,
  cancelReturnPath?: string,
): string {
  const path =
    cancelReturnPath && PPI_CHECKOUT_CANCEL_PATHS.has(cancelReturnPath)
      ? cancelReturnPath
      : "/inspections/pre-purchase";
  return `${baseUrl}${path}#book`;
}

export async function createPrePurchaseStripeCheckoutSession(
  payload: PrePurchaseBookingPayload,
  cancelReturnPath?: string,
): Promise<{ url: string; sessionId: string } | null> {
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
            name: PPI_CUSTOMER_BOOKING_HEADING,
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
      ppiVehicleCategory: payload.vehicleCategory.slice(0, 64),
    },
    success_url: `${baseUrl}/inspections/pre-purchase/booking/success?ref=${encodeURIComponent(payload.bookingRef)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: resolvePpiCancelUrl(baseUrl, cancelReturnPath),
  });

  if (!session.url) return null;
  return { url: session.url, sessionId: session.id };
}
