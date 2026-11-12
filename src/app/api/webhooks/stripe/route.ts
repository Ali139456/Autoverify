import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendPurchaseConfirmationEmail } from "@/lib/email";
import { fulfillLavBooking } from "@/lib/lav/fulfill-booking";
import { notifyPrePurchaseBooking } from "@/lib/pre-purchase/booking-email";
import type { PrePurchaseBookingPayload } from "@/lib/pre-purchase/types";
import { PPI_PRICE_INC_GST } from "@/lib/pre-purchase/parse-booking-body";
import {
  getLavBookingByStripeSession,
  updateLavBooking,
} from "@/lib/lav/booking-store";
import { getStripe } from "@/lib/stripe";
import { getReport, updateReport } from "@/lib/store";
import { guardRateLimit, isProductionRuntime, secureJson } from "@/lib/security";

export async function POST(req: NextRequest) {
  const rateLimited = guardRateLimit(req, "webhook-stripe", 120, 60 * 60 * 1000);
  if (rateLimited) return rateLimited;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    const status = isProductionRuntime() ? 503 : 500;
    return secureJson({ error: "Webhook secret not configured." }, { status });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const ppiRef = session.metadata?.ppiBookingRef?.trim();
    if (ppiRef && session.payment_status === "paid") {
      const meta = session.metadata ?? {};
      const payload: PrePurchaseBookingPayload = {
        bookingRef: ppiRef,
        submittedAt: new Date().toISOString(),
        contactName: meta.ppiContactName ?? "",
        contactEmail:
          session.customer_details?.email ??
          session.customer_email ??
          "",
        contactPhone: meta.ppiContactPhone ?? "",
        suburb: String(meta.ppiSuburb ?? "").replace(/\s+NSW.*$/, ""),
        postcode: String(meta.ppiSuburb ?? "").match(/\b(2\d{3})\b/)?.[1] ?? "",
        addressLine: "",
        accessNotes: "",
        vehicleRego: String(meta.ppiRego ?? "").split(" ")[0] ?? "",
        vehicleState:
          String(meta.ppiRego ?? "").split(" ").pop() ?? "NSW",
        vehicleVin: "",
        vehicleMake: "",
        vehicleModel: "",
        vehicleYear: "",
        preferredWhen: meta.ppiWhen ?? "",
        priceIncGst: PPI_PRICE_INC_GST,
      };
      const vehicleBits = String(meta.ppiVehicle ?? "").trim().split(/\s+/);
      if (vehicleBits.length >= 3) {
        payload.vehicleYear = vehicleBits[0] ?? "";
        payload.vehicleMake = vehicleBits[1] ?? "";
        payload.vehicleModel = vehicleBits.slice(2).join(" ");
      }
      await notifyPrePurchaseBooking(payload, true).catch((err) => {
        console.error("[webhooks/stripe] PPI notify failed:", err);
      });
      return NextResponse.json({ received: true });
    }

    const lavRef = session.metadata?.lavBookingRef?.trim();
    if (lavRef && session.payment_status === "paid") {
      const existing = await getLavBookingByStripeSession(session.id);
      const bookingRef = existing?.bookingRef ?? lavRef;
      await updateLavBooking(bookingRef, {
        status: "paid",
        stripeSessionId: session.id,
      });
      try {
        await fulfillLavBooking(bookingRef);
      } catch (err) {
        console.error("[webhooks/stripe] LAV fulfill failed:", err);
        await updateLavBooking(bookingRef, { status: "failed" });
      }
      return NextResponse.json({ received: true });
    }

    const reportId = session.metadata?.reportId;
    if (reportId && session.payment_status === "paid") {
      const email =
        session.customer_details?.email ??
        session.customer_email ??
        undefined;
      await updateReport(reportId, {
        status: "paid",
        customerEmail: email ?? null,
      });
      const report = await getReport(reportId);
      if (report && email) {
        await sendPurchaseConfirmationEmail(report, email, {
          stripeSessionId: session.id,
        }).catch(() => null);
      }
    }
  }

  return NextResponse.json({ received: true });
}
