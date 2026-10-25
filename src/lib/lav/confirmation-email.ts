import { getContactInboxEmail } from "@/lib/site-contact";
import { getBaseUrl } from "@/lib/stripe";
import { buildReportPublicUrls } from "@/lib/ravin-report-trace";
import type { LavBookingPayload, LavCaptureLink } from "./types";

export async function sendLavBookingConfirmationEmail(input: {
  payload: LavBookingPayload;
  captureLinks: LavCaptureLink[];
  assetReportIds: string[];
  invoiceAccount: boolean;
  digital: boolean;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return;

  const from =
    process.env.RESEND_FROM?.trim() ??
    "Auto Verifi <noreply@autoverifi.com.au>";
  const baseUrl = getBaseUrl();
  const { payload, captureLinks, assetReportIds, invoiceAccount, digital } =
    input;

  const recipients = new Set<string>();
  recipients.add(payload.contactEmail.trim().toLowerCase());
  payload.ccEmails
    .split(/[,;]/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .forEach((e) => recipients.add(e));

  const inbox = getContactInboxEmail();
  if (inbox) recipients.add(inbox.toLowerCase());

  const linkRows = captureLinks
    .map(
      (link) =>
        `<li><strong>Asset ${link.assetIndex}:</strong> ${link.label}<br/><a href="${link.inspectUrl}">${link.inspectUrl}</a></li>`,
    )
    .join("");

  const reportRows = assetReportIds
    .map((id) => {
      const urls = buildReportPublicUrls(baseUrl, id);
      return `<li><a href="${urls.reportUrl}">${id}</a> · <a href="${urls.pdfUrl}">PDF</a></li>`;
    })
    .join("");

  const paymentNote = invoiceAccount
    ? "<p>You will be <strong>invoiced separately</strong>. This email is your confirmation only (not a tax invoice).</p>"
    : "<p>Payment was processed via Stripe. Your tax invoice is available from the Stripe receipt.</p>";

  const captureNote = digital
    ? `<p>Capture links (one per asset) were sent to the vendor by SMS where possible:</p><ul>${linkRows || "<li>Links pending — our team will follow up.</li>"}</ul>`
    : "<p>A physical inspection has been queued — an Auto Verifi inspector will attend the asset location.</p>";

  const html = `
    <div style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a">
      <h1 style="font-size:1.25rem">Lender asset verification booked</h1>
      <p>Reference <strong>${payload.bookingRef}</strong></p>
      ${paymentNote}
      ${captureNote}
      <p>Verification reports (LAV format):</p>
      <ul>${reportRows}</ul>
      <p style="color:#64748b;font-size:0.9rem">Lender: ${payload.lender} · Borrower: ${payload.borrower}</p>
    </div>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [...recipients],
      subject: `Asset verification ${payload.bookingRef} — confirmation`,
      html,
    }),
  });
}
