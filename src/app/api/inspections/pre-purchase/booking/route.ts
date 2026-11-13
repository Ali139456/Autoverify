import { NextRequest, NextResponse } from "next/server";
import { allocatePrePurchaseBookingRef } from "@/lib/pre-purchase/booking-ref";
import { notifyPrePurchaseBooking } from "@/lib/pre-purchase/booking-email";
import { parsePrePurchaseBookingBody } from "@/lib/pre-purchase/parse-booking-body";
import { createPrePurchaseStripeCheckoutSession } from "@/lib/pre-purchase/stripe-checkout";
import type { PrePurchaseBookingPayload } from "@/lib/pre-purchase/types";
import { sendPrePurchaseCustomerConfirmationEmail } from "@/lib/pre-purchase/confirmation-email";
import { getBaseUrl, isStripeConfigured } from "@/lib/stripe";
import { guardBrowserPost, readBoundedJson } from "@/lib/security";

export async function POST(req: NextRequest) {
  const blocked = guardBrowserPost(req, "ppi-booking", 8, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const body = (await readBoundedJson(req)) as Record<string, unknown>;
    const parsed = parsePrePurchaseBookingBody(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const payload: PrePurchaseBookingPayload = {
      ...parsed.payload,
      bookingRef: allocatePrePurchaseBookingRef(),
    };

    const unitCents = Math.round(payload.priceIncGst * 100);
    if (unitCents <= 0) {
      await notifyPrePurchaseBooking(payload, true);
      await sendPrePurchaseCustomerConfirmationEmail(payload).catch((err) => {
        console.error("[ppi-booking] customer email failed:", err);
      });
      const baseUrl = getBaseUrl();
      return NextResponse.json({
        ok: true,
        bookingRef: payload.bookingRef,
        successUrl: `${baseUrl}/inspections/pre-purchase/booking/success?ref=${encodeURIComponent(payload.bookingRef)}`,
      });
    }

    if (!isStripeConfigured()) {
      await notifyPrePurchaseBooking(payload, false);
      return NextResponse.json({
        ok: true,
        bookingRef: payload.bookingRef,
        fallback: true,
        message:
          "Booking request sent to Auto Verifi. Online payment is not configured on this environment.",
      });
    }

    const checkoutUrl = await createPrePurchaseStripeCheckoutSession(payload);
    if (!checkoutUrl) {
      await notifyPrePurchaseBooking(payload, false);
      return NextResponse.json({
        ok: true,
        bookingRef: payload.bookingRef,
        fallback: true,
        message: "Booking saved — we could not start checkout. Our team will contact you.",
      });
    }

    return NextResponse.json({
      ok: true,
      bookingRef: payload.bookingRef,
      checkoutUrl,
    });
  } catch (err) {
    console.error("[ppi-booking]", err);
    return NextResponse.json(
      { error: "Could not submit booking. Please try again." },
      { status: 500 },
    );
  }
}
