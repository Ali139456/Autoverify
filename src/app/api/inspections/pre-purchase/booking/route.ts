import { NextRequest, NextResponse } from "next/server";
import { allocatePrePurchaseBookingRef } from "@/lib/pre-purchase/booking-ref";
import { notifyPrePurchaseBooking } from "@/lib/pre-purchase/booking-email";
import { parsePrePurchaseBookingBody } from "@/lib/pre-purchase/parse-booking-body";
import { createPrePurchaseStripeCheckoutSession } from "@/lib/pre-purchase/stripe-checkout";
import type { PrePurchaseBookingPayload } from "@/lib/pre-purchase/types";
import { sendPrePurchaseCustomerConfirmationEmail } from "@/lib/pre-purchase/confirmation-email";
import { savePpiBooking } from "@/lib/pre-purchase/booking-store";
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
      await savePpiBooking(payload, "paid").catch((err) => {
        console.error("[ppi-booking] save failed:", err);
      });
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

    const cancelReturnPath =
      typeof body.cancelReturnPath === "string"
        ? body.cancelReturnPath.trim()
        : undefined;
    const checkout = await createPrePurchaseStripeCheckoutSession(
      payload,
      cancelReturnPath,
    );
    if (!checkout) {
      await notifyPrePurchaseBooking(payload, false);
      return NextResponse.json({
        ok: true,
        bookingRef: payload.bookingRef,
        fallback: true,
        message: "Booking saved — we could not start checkout. Our team will contact you.",
      });
    }

    await savePpiBooking(payload, "pending_payment", checkout.sessionId).catch(
      (err) => {
        console.error("[ppi-booking] save failed:", err);
      },
    );

    return NextResponse.json({
      ok: true,
      bookingRef: payload.bookingRef,
      checkoutUrl: checkout.url,
    });
  } catch (err) {
    console.error("[ppi-booking]", err);
    return NextResponse.json(
      { error: "Could not submit booking. Please try again." },
      { status: 500 },
    );
  }
}
