import { getCompanyDetails } from "@/lib/company";
import {
  PURCHASE_EMAIL_FOOTER_LOGO_HEIGHT,
  PURCHASE_EMAIL_FOOTER_LOGO_WIDTH,
  PURCHASE_EMAIL_HEADER_LOGO_HEIGHT,
  PURCHASE_EMAIL_HEADER_LOGO_WIDTH,
  REPORT_LOGO_PNG_PATH,
  REPORT_LOGO_OBJECT_POSITION,
} from "@/lib/report-logo-size";
import type { LavBookingPayload, LavCaptureLink } from "./types";

const BRAND_BLUE = "#0073E3";
const BRAND_NAVY = "#0f172a";
const ACCENT_ORANGE = "#E87722";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatAuDate(date: Date): string {
  return date.toLocaleDateString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function buildLavBookingConfirmationEmailHtml(input: {
  payload: LavBookingPayload;
  captureLinks: LavCaptureLink[];
  invoiceAccount: boolean;
  digital: boolean;
  baseUrl: string;
}): string {
  const {
    payload,
    captureLinks,
    invoiceAccount,
    digital,
    baseUrl,
  } = input;
  const company = getCompanyDetails(baseUrl);
  const generatedOn = formatAuDate(new Date());
  const logoUrl = `${baseUrl.replace(/\/$/, "")}${REPORT_LOGO_PNG_PATH}`;
  const privacyUrl = `${baseUrl.replace(/\/$/, "")}/privacy`;
  const termsUrl = `${baseUrl.replace(/\/$/, "")}/terms`;

  const paymentBlock = invoiceAccount
    ? `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">You will be <strong>invoiced separately</strong>. This email is your confirmation only — it is <strong>not</strong> a tax invoice.</p>`
    : `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">Payment was processed at checkout. Your tax invoice is available from your Stripe receipt.</p>`;

  const captureRows = captureLinks
    .map(
      (link) => `
        <tr>
          <td style="padding:14px 16px;border-bottom:1px solid #e2e8f0;">
            <span style="font-size:14px;font-weight:700;color:${BRAND_NAVY};">Asset ${link.assetIndex}: ${escapeHtml(link.label)}</span>
            <p style="margin:8px 0 0;">
              <a href="${escapeHtml(link.inspectUrl)}" style="display:inline-block;background:${ACCENT_ORANGE};color:#ffffff;font-size:13px;font-weight:800;text-decoration:none;padding:11px 20px;border-radius:10px;">Open capture link</a>
            </p>
            <p style="margin:8px 0 0;font-size:12px;line-height:1.5;color:#64748b;word-break:break-all;">${escapeHtml(link.inspectUrl)}</p>
          </td>
        </tr>`,
    )
    .join("");

  const captureSection = digital
    ? `<h2 style="margin:0 0 12px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND_BLUE};">Digital capture links</h2>
       <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#475569;">Links were sent to the vendor by SMS where possible. You can also open or forward them below.</p>
       <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;">
         ${captureRows || `<tr><td style="padding:14px 16px;font-size:14px;color:#64748b;">Capture links are being prepared — our team will follow up shortly.</td></tr>`}
       </table>`
    : `<p style="margin:0;font-size:15px;line-height:1.65;color:#334155;">A <strong>physical inspection</strong> has been queued. An Auto Verifi inspector will attend the asset location.</p>`;

  const summaryRows = [
    ["Booking reference", payload.bookingRef],
    ["Inspection", payload.inspectionType],
    ["Lender", payload.lender || "—"],
    ["Borrower", payload.borrower || "—"],
    ...(payload.reference.trim()
      ? ([["Deal reference", payload.reference.trim()]] as [string, string][])
      : []),
  ]
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:11px 14px;border-bottom:1px solid #dbeafe;color:#475569;font-size:13px;width:38%;background:#f8fafc;">${escapeHtml(label)}</td>
          <td style="padding:11px 14px;border-bottom:1px solid #dbeafe;color:${BRAND_NAVY};font-size:13px;font-weight:700;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Lender asset verification booked</title>
</head>
<body style="margin:0;padding:0;background:#e8eef5;font-family:Arial,Helvetica,sans-serif;color:#334155;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#e8eef5;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="620" style="max-width:620px;width:100%;border-collapse:separate;border-spacing:0;">
          <tr>
            <td style="background:#ffffff;padding:26px 32px 18px;border-radius:14px 14px 0 0;border:1px solid #dbeafe;border-bottom:3px solid ${BRAND_BLUE};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" valign="top">
                    <img src="${escapeHtml(logoUrl)}" alt="Auto Verifi" width="${PURCHASE_EMAIL_HEADER_LOGO_WIDTH}" height="${PURCHASE_EMAIL_HEADER_LOGO_HEIGHT}" style="display:block;border:0;height:${PURCHASE_EMAIL_HEADER_LOGO_HEIGHT}px!important;width:auto!important;max-width:${PURCHASE_EMAIL_HEADER_LOGO_WIDTH}px!important;object-fit:contain;object-position:${REPORT_LOGO_OBJECT_POSITION};" />
                    <p style="margin:10px 0 0;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${BRAND_BLUE};">Lender asset verification</p>
                  </td>
                  <td align="right" valign="top" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;line-height:1.6;">
                    Booked<br />${escapeHtml(generatedOn)}<br />
                    <a href="${escapeHtml(company.websiteUrl)}" style="color:${BRAND_BLUE};font-weight:700;text-decoration:none;text-transform:none;">${escapeHtml(company.website)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:24px 32px 8px;border-left:1px solid #dbeafe;border-right:1px solid #dbeafe;">
              <h1 style="margin:0;font-size:24px;line-height:1.25;color:${BRAND_NAVY};font-weight:800;">Booking confirmed</h1>
              <p style="margin:14px 0 0;font-size:15px;line-height:1.65;color:#334155;">Thank you for booking with <strong style="color:${BRAND_BLUE};">Auto Verifi</strong>. Reference <strong>${escapeHtml(payload.bookingRef)}</strong>.</p>
              ${paymentBlock}
            </td>
          </tr>
          <tr>
            <td style="background:#eff6ff;padding:22px 32px;border-left:1px solid #dbeafe;border-right:1px solid #dbeafe;">
              <h2 style="margin:0 0 12px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND_BLUE};">Booking summary</h2>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #bfdbfe;border-radius:10px;border-collapse:separate;overflow:hidden;background:#ffffff;">
                ${summaryRows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:22px 32px;border-left:1px solid #dbeafe;border-right:1px solid #dbeafe;">
              ${captureSection}
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:22px 32px;border-radius:0 0 14px 14px;border:1px solid #dbeafe;border-top:0;">
              <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#475569;">Questions? Email <a href="mailto:${escapeHtml(company.email)}" style="color:${BRAND_BLUE};font-weight:700;text-decoration:none;">${escapeHtml(company.email)}</a></p>
              <p style="margin:0;font-size:13px;">
                <a href="${escapeHtml(termsUrl)}" style="color:${BRAND_BLUE};font-weight:600;">Terms of use</a>
                &nbsp;&middot;&nbsp;
                <a href="${escapeHtml(privacyUrl)}" style="color:${BRAND_BLUE};font-weight:600;">Privacy</a>
              </p>
              <img src="${escapeHtml(logoUrl)}" alt="" width="${PURCHASE_EMAIL_FOOTER_LOGO_WIDTH}" height="${PURCHASE_EMAIL_FOOTER_LOGO_HEIGHT}" style="display:block;margin:16px 0 0;border:0;opacity:0.85;height:${PURCHASE_EMAIL_FOOTER_LOGO_HEIGHT}px!important;width:auto!important;max-width:${PURCHASE_EMAIL_FOOTER_LOGO_WIDTH}px!important;" />
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
