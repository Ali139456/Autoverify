import {
  buildBrandedEmailLayout,
  escapeBrandedEmailHtml,
} from "@/lib/branded-email-layout";
import { generatePpiTaxInvoicePdfBuffer } from "@/lib/ppi-tax-invoice-pdf-buffer";
import { getContactInboxEmail } from "@/lib/site-contact";
import { getBaseUrl } from "@/lib/stripe";
import { PPI_CUSTOMER_BOOKING_HEADING } from "./constants";
import {
  listPriceForPpiVehicleCategory,
  normalizePpiVehicleCategory,
} from "./vehicle-pricing";
import type { PrePurchaseBookingPayload } from "./types";

export { PPI_CUSTOMER_BOOKING_HEADING } from "./constants";

const BRAND_BLUE = "#0073E3";
const BRAND_NAVY = "#0f172a";

function formatPpiMoneyAud(amountIncGst: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(amountIncGst);
}

function buildPpiTaxInvoiceSummaryHtml(
  payload: PrePurchaseBookingPayload,
): string {
  const vehicle = `${payload.vehicleYear} ${payload.vehicleMake} ${payload.vehicleModel}`.trim();
  const listPrice = listPriceForPpiVehicleCategory(
    normalizePpiVehicleCategory(payload.vehicleCategory),
  );
  const amountLabel = formatPpiMoneyAud(payload.priceIncGst);
  const rows: [string, string][] = [
    ["Tax invoice no.", payload.bookingRef],
    ["Description", PPI_CUSTOMER_BOOKING_HEADING],
    ["Vehicle", vehicle || "—"],
    ["Booking reference", payload.bookingRef],
    ["Amount (incl. GST)", amountLabel],
  ];
  if (payload.promoCode.trim() && payload.priceIncGst < listPrice) {
    rows.splice(4, 0, [
      "List price (incl. GST)",
      formatPpiMoneyAud(listPrice),
    ]);
  }

  const invoiceTable = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:11px 14px;border-bottom:1px solid #dbeafe;color:#475569;font-size:13px;width:40%;background:#f8fafc;">${escapeBrandedEmailHtml(label)}</td>
          <td style="padding:11px 14px;border-bottom:1px solid #dbeafe;color:${BRAND_NAVY};font-size:13px;font-weight:700;">${escapeBrandedEmailHtml(value)}</td>
        </tr>`,
    )
    .join("");

  return `<div style="margin-top:22px;background:#eff6ff;padding:18px 16px;border:1px solid #dbeafe;border-radius:10px;">
  <h2 style="margin:0 0 12px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND_BLUE};">Tax invoice summary</h2>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #bfdbfe;border-radius:10px;border-collapse:separate;overflow:hidden;background:#ffffff;">
    ${invoiceTable}
  </table>
  <p style="margin:14px 0 0;font-size:13px;color:#334155;line-height:1.55;">
    Your official tax invoice PDF is attached to this email.
  </p>
</div>`;
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

  const bodyHtml = `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #e2e8f0;border-radius:10px;border-collapse:separate;overflow:hidden;margin-top:4px;">
  <tr><td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;"><strong>Booking ref</strong><br />${escapeBrandedEmailHtml(payload.bookingRef)}</td></tr>
  <tr><td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;"><strong>Vehicle</strong><br />${escapeBrandedEmailHtml(vehicle)}</td></tr>
  <tr><td style="padding:12px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;"><strong>Rego</strong><br />${escapeBrandedEmailHtml(payload.vehicleRego)} ${escapeBrandedEmailHtml(payload.vehicleState)}</td></tr>
  <tr><td style="padding:12px 14px;font-size:13px;"><strong>Location</strong><br />${escapeBrandedEmailHtml(location || "—")}</td></tr>
</table>
${buildPpiTaxInvoiceSummaryHtml(payload)}
<p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#475569;"><strong>Our team will confirm the inspection date and inspector details by email or phone within 24 hours.</strong></p>`;

  const html = buildBrandedEmailLayout({
    baseUrl,
    eyebrow: PPI_CUSTOMER_BOOKING_HEADING,
    title: "Booking confirmed",
    headerMetaLabel: "Booked",
    introHtml: `Hi ${escapeBrandedEmailHtml(payload.contactName)}, thanks — your pre-purchase inspection is confirmed.`,
    bodyHtml,
  });

  const attachments: { filename: string; content: string }[] = [];
  try {
    const invoicePdf = await generatePpiTaxInvoicePdfBuffer(payload);
    attachments.push({
      filename: "Auto-Verifi-Tax-Invoice.pdf",
      content: invoicePdf.toString("base64"),
    });
  } catch (err) {
    console.error("[ppi-booking] tax invoice PDF failed:", err);
  }

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
      attachments: attachments.length > 0 ? attachments : undefined,
    }),
  });
}