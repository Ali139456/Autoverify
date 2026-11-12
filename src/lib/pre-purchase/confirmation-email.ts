import { getCompanyDetails } from "@/lib/company";
import { getContactInboxEmail } from "@/lib/site-contact";
import { getBaseUrl } from "@/lib/stripe";
import type { PrePurchaseBookingPayload } from "./types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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
  const company = getCompanyDetails(baseUrl);
  const vehicle = `${payload.vehicleYear} ${payload.vehicleMake} ${payload.vehicleModel}`.trim();
  const location = [
    payload.addressLine,
    payload.suburb,
    `NSW ${payload.postcode}`,
  ]
    .filter((s) => s.trim())
    .join(", ");

  const html = `<!DOCTYPE html><html lang="en"><body style="font-family:Arial,sans-serif;color:#334155;line-height:1.55;">
    <p>Hi ${escapeHtml(payload.contactName)},</p>
    <p>Thanks — your pre-purchase inspection booking <strong>${escapeHtml(payload.bookingRef)}</strong> is confirmed.</p>
    <p><strong>Vehicle:</strong> ${escapeHtml(vehicle)}<br />
    <strong>Rego:</strong> ${escapeHtml(payload.vehicleRego)} ${escapeHtml(payload.vehicleState)}<br />
    <strong>Location:</strong> ${escapeHtml(location || "—")}<br />
    <strong>Preferred time:</strong> ${escapeHtml(payload.preferredWhen || "We'll contact you to schedule")}</p>
    <p>Our team will confirm the inspection date and inspector details by email or phone. Your Stripe receipt is your tax invoice for the $${payload.priceIncGst.toFixed(2)} inc GST fee.</p>
    <p>Questions? <a href="mailto:${escapeHtml(company.email)}">${escapeHtml(company.email)}</a></p>
    </body></html>`;

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
      subject: `Pre-purchase inspection booked — ${payload.bookingRef}`,
      html,
    }),
  });
}
