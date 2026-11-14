import {
  buildBrandedEmailLayout,
  escapeBrandedEmailHtml,
} from "@/lib/branded-email-layout";
import { getContactInboxEmail } from "@/lib/site-contact";
import { getBaseUrl } from "@/lib/stripe";
import { PPI_PRICE_INC_GST } from "./parse-booking-body";
import type { PrePurchaseBookingPayload } from "./types";

/** Customer booking email eyebrow, title, and Stripe line item branding. */
export const PPI_CUSTOMER_BOOKING_HEADING =
  "Auto Verifi - Pre purchase inspection";

export function formatPrePurchasePaymentNote(
  payload: PrePurchaseBookingPayload,
): string {
  const charged = payload.priceIncGst;
  const promo = payload.promoCode?.trim().toUpperCase();
  const listLabel = `$${PPI_PRICE_INC_GST} inc GST`;

  if (charged <= 0) {
    if (promo === "AVFREE") {
      return `Promotional code AVFREE applied — no payment was charged (inspection fee otherwise ${listLabel}). There is no Stripe receipt for this booking.`;
    }
    if (promo) {
      return `Promotional code ${promo} applied — no payment was charged (inspection fee otherwise ${listLabel}). There is no Stripe receipt for this booking.`;
    }
    return `No payment was charged for this booking (inspection fee otherwise ${listLabel}).`;
  }

  if (promo && charged < PPI_PRICE_INC_GST) {
    return `Your Stripe receipt is your tax invoice for the $${charged.toFixed(2)} inc GST fee (code ${promo} applied; list price ${listLabel}).`;
  }

  return `Your Stripe receipt is your tax invoice for the $${charged.toFixed(2)} inc GST fee.`;
}

export async function sendPrePurchaseCustomerConfirmationEmail(
  payload: PrePurchaseBookingPayload,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return;

  const from =
    process.env.RESEND_FROM?.trim() ??
    "Auto Verifi <noreply@autoverifi.com.au>";
  const baseUrl = getBaseUrl();
  const vehicle = `${payload.vehicleYear} ${payload.vehicleMake} ${payload.vehicleModel}`.trim();
  const location = [
    payload.addressLine,
    payload.suburb,
    `NSW ${payload.postcode}`,
  ]
    .filter((s) => s.trim())
    .join(", ");
  const paidNote = formatPrePurchasePaymentNote(payload);

  const bodyHtml = `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e2e8f0;border-radius:10px;border-collapse:separate;overflow:hidden;margin-top:4px;">
  <tr><td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;"><strong>Booking ref</strong><br />${escapeBrandedEmailHtml(payload.bookingRef)}</td></tr>
  <tr><td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;"><strong>Vehicle</strong><br />${escapeBrandedEmailHtml(vehicle)}</td></tr>
  <tr><td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;"><strong>Rego</strong><br />${escapeBrandedEmailHtml(payload.vehicleRego)} ${escapeBrandedEmailHtml(payload.vehicleState)}</td></tr>
  <tr><td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;"><strong>Location</strong><br />${escapeBrandedEmailHtml(location || "—")}</td></tr>
  <tr><td style="padding:12px 14px;font-size:13px;"><strong>Preferred time</strong><br />${escapeBrandedEmailHtml(payload.preferredWhen || "We'll contact you to schedule")}</td></tr>
</table>
<p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#475569;">${escapeBrandedEmailHtml(paidNote)} Our team will confirm the inspection date and inspector details by email or phone.</p>`;

  const html = buildBrandedEmailLayout({
    baseUrl,
    eyebrow: PPI_CUSTOMER_BOOKING_HEADING,
    title: "Booking confirmed",
    headerMetaLabel: "Booked",
    introHtml: `Hi ${escapeBrandedEmailHtml(payload.contactName)}, thanks — your pre-purchase inspection is confirmed.`,
    bodyHtml,
  });

  const to = [payload.contactEmail.trim().toLowerCase()];
  const inbox = getContactInboxEmail()?.toLowerCase();
  const bcc = inbox && !to.includes(inbox) ? [inbox] : undefined;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      bcc,
      subject: `${PPI_CUSTOMER_BOOKING_HEADING} — ${payload.bookingRef}`,
      html,
    }),
  });
}