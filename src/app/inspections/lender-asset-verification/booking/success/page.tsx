import Link from "next/link";
import { fulfillLavBooking } from "@/lib/lav/fulfill-booking";
import {
  getLavBookingByRef,
  getLavBookingByStripeSession,
  updateLavBooking,
} from "@/lib/lav/booking-store";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export default async function LavBookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; session_id?: string }>;
}) {
  const { ref, session_id: sessionId } = await searchParams;
  let bookingRef = ref?.trim() ?? "";
  let captureLinks: { label: string; inspectUrl: string; assetIndex: number }[] =
    [];

  if (sessionId) {
    const bySession = await getLavBookingByStripeSession(sessionId);
    if (bySession) bookingRef = bySession.bookingRef;
  }

  if (bookingRef && sessionId && isStripeConfigured()) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        await updateLavBooking(bookingRef, {
          status: "paid",
          stripeSessionId: sessionId,
        });
      }
    } catch {
      // Webhook may have already updated the booking.
    }
  }

  if (bookingRef) {
    let record = await getLavBookingByRef(bookingRef);
    if (
      record &&
      (record.status === "paid" || record.status === "invoiced") &&
      !record.fulfillment
    ) {
      try {
        await fulfillLavBooking(bookingRef);
        record = await getLavBookingByRef(bookingRef);
      } catch {
        // Webhook may fulfill shortly after redirect.
      }
    }
    captureLinks = record?.fulfillment?.captureLinks ?? [];
  }

  return (
    <div className="lav min-h-[60vh] px-4 py-16">
      <div className="av-site-container mx-auto max-w-xl text-center">
        <h1 className="text-2xl font-extrabold text-white">Payment received</h1>
        <p className="mt-3 text-slate-400">
          {bookingRef ? (
            <>
              Booking reference <strong className="text-white">{bookingRef}</strong>.
              We&apos;ve emailed confirmation and capture links.
            </>
          ) : (
            "Your booking is being processed."
          )}
        </p>
        {captureLinks.length > 0 ? (
          <ul className="mt-8 space-y-3 text-left text-sm text-slate-300">
            {captureLinks.map((link) => (
              <li
                key={link.inspectUrl}
                className="rounded-xl border border-white/10 bg-ink-800/80 p-4"
              >
                <p className="font-semibold text-white">
                  Asset {link.assetIndex}: {link.label}
                </p>
                <a
                  href={link.inspectUrl}
                  className="mt-2 inline-block text-accent-500 underline"
                >
                  Vendor capture link
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        <Link
          href="/inspections/lender-asset-verification#book"
          className="btn btn-light no-arrow mt-10 inline-flex"
        >
          Back to Lender Asset Verification
        </Link>
      </div>
    </div>
  );
}
