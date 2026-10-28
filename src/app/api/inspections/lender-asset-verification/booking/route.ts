import { after, NextRequest, NextResponse } from "next/server";
import { sendContactFormEmail } from "@/lib/email";
import {
  isLavBookingStoreConfigured,
  saveLavBooking,
  updateLavBooking,
} from "@/lib/lav/booking-store";
import { fulfillLavBooking } from "@/lib/lav/fulfill-booking";
import { allocateLavBookingRef } from "@/lib/lav/booking-ref";
import { parseLavBookingBody } from "@/lib/lav/parse-booking-body";
import { createLavStripeCheckoutSession } from "@/lib/lav/stripe-checkout";
import { LAV_INVOICE_PROMO } from "@/lib/lav/types";
import { isStripeConfigured } from "@/lib/stripe";
import {
  guardBrowserPost,
  readBoundedJson,
} from "@/lib/security";

function formatBookingMessage(payload: Record<string, unknown>): string {
  const assets = Array.isArray(payload.assets) ? payload.assets : [];
  return [
    `Booking ref: ${payload.bookingRef}`,
    `Inspection: ${payload.inspectionType}`,
    `Total: ${payload.subtotal} + GST ${payload.gst} = ${payload.estimate} inc GST`,
    "",
    ...assets.map((raw, i) => {
      const a = raw as Record<string, unknown>;
      return `Asset ${i + 1}: ${a.type} | ${a.year} ${a.make} ${a.model}`;
    }),
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const blocked = guardBrowserPost(req, "lav-booking", 6, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const body = (await readBoundedJson(req)) as Record<string, unknown>;
    const parsed = parseLavBookingBody(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const { payload: parsedPayload } = parsed;
    const bookingRef = await allocateLavBookingRef();
    const payload = { ...parsedPayload, bookingRef };
    const invoiceAccount = payload.promoCode === LAV_INVOICE_PROMO;

    if (!isLavBookingStoreConfigured()) {
      await sendContactFormEmail({
        name: payload.contactName,
        email: payload.contactEmail,
        phone: payload.contactPhone,
        subject: `Asset verification booking ${payload.bookingRef}`,
        message: formatBookingMessage(payload as unknown as Record<string, unknown>),
      });
      return NextResponse.json({
        ok: true,
        bookingRef: payload.bookingRef,
        fallback: true,
        message:
          "Booking emailed to Auto Verifi. Full capture links require Supabase on the server.",
      });
    }

    await saveLavBooking(
      payload,
      invoiceAccount ? "invoiced" : "pending_payment",
    );

    if (invoiceAccount) {
      after(async () => {
        try {
          await fulfillLavBooking(payload.bookingRef);
        } catch (err) {
          console.error("[lav-booking] async fulfill failed:", err);
          await updateLavBooking(payload.bookingRef, { status: "failed" });
        }
      });
      return NextResponse.json({
        ok: true,
        bookingRef: payload.bookingRef,
        invoiced: true,
        processing: true,
      });
    }

    if (isStripeConfigured()) {
      const checkoutUrl = await createLavStripeCheckoutSession(payload);
      if (checkoutUrl) {
        return NextResponse.json({
          ok: true,
          bookingRef: payload.bookingRef,
          checkoutUrl,
        });
      }
    }

    await updateLavBooking(payload.bookingRef, { status: "paid" });
    after(async () => {
      try {
        await fulfillLavBooking(payload.bookingRef);
      } catch (err) {
        console.error("[lav-booking] async fulfill failed:", err);
        await updateLavBooking(payload.bookingRef, { status: "failed" });
      }
    });
    return NextResponse.json({
      ok: true,
      bookingRef: payload.bookingRef,
      demo: true,
      processing: true,
    });
  } catch (err) {
    console.error("[lav-booking]", err);
    return NextResponse.json(
      { error: "We could not submit your booking. Please email us directly." },
      { status: 503 },
    );
  }
}
