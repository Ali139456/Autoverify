import { getCompanyDetails } from "@/lib/company";
import {
  PURCHASE_EMAIL_FOOTER_LOGO_HEIGHT,
  PURCHASE_EMAIL_FOOTER_LOGO_WIDTH,
  PURCHASE_EMAIL_HEADER_LOGO_HEIGHT,
  PURCHASE_EMAIL_HEADER_LOGO_WIDTH,
  REPORT_LOGO_PNG_PATH,
  REPORT_LOGO_OBJECT_POSITION,
} from "@/lib/report-logo-size";

const BRAND_BLUE = "#0073E3";
const BRAND_NAVY = "#0f172a";

export type ContactFormEmailPayload = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatAuDateTime(date: Date): string {
  return date.toLocaleString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function detailRow(label: string, valueHtml: string): string {
  return `
        <tr>
          <td style="padding:11px 14px;border-bottom:1px solid #dbeafe;color:#475569;font-size:13px;width:32%;background:#f8fafc;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:11px 14px;border-bottom:1px solid #dbeafe;color:${BRAND_NAVY};font-size:13px;font-weight:600;vertical-align:top;">${valueHtml}</td>
        </tr>`;
}

/** Branded inbox notification for website Contact us submissions. */
export function buildContactFormNotificationEmailHtml(input: {
  payload: ContactFormEmailPayload;
  baseUrl: string;
  receivedAt?: Date;
}): string {
  const { payload, baseUrl } = input;
  const receivedAt = input.receivedAt ?? new Date();
  const company = getCompanyDetails(baseUrl);
  const logoUrl = `${baseUrl.replace(/\/$/, "")}${REPORT_LOGO_PNG_PATH}`;
  const privacyUrl = `${baseUrl.replace(/\/$/, "")}/privacy`;
  const termsUrl = `${baseUrl.replace(/\/$/, "")}/terms`;

  const name = escapeHtml(payload.name.trim());
  const email = escapeHtml(payload.email.trim().toLowerCase());
  const phone = payload.phone?.trim()
    ? escapeHtml(payload.phone.trim())
    : null;
  const topic = payload.subject?.trim()
    ? escapeHtml(payload.subject.trim())
    : "General enquiry";
  const messageHtml = escapeHtml(payload.message.trim()).replace(/\n/g, "<br/>");

  const rows = [
    detailRow("Name", name),
    detailRow(
      "Email",
      `<a href="mailto:${email}" style="color:${BRAND_BLUE};font-weight:700;text-decoration:none;">${email}</a>`,
    ),
    ...(phone ? [detailRow("Phone", `<a href="tel:${phone.replace(/\s/g, "")}" style="color:${BRAND_BLUE};font-weight:700;text-decoration:none;">${phone}</a>`)] : []),
    detailRow("Topic", topic),
  ].join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Auto Verifi contact form</title>
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
                    <p style="margin:10px 0 0;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${BRAND_BLUE};">Contact form</p>
                  </td>
                  <td align="right" valign="top" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;line-height:1.6;">
                    Received<br />${escapeHtml(formatAuDateTime(receivedAt))}<br />
                    <a href="${escapeHtml(company.websiteUrl)}" style="color:${BRAND_BLUE};font-weight:700;text-decoration:none;text-transform:none;">${escapeHtml(company.website)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:24px 32px 8px;border-left:1px solid #dbeafe;border-right:1px solid #dbeafe;">
              <h1 style="margin:0;font-size:22px;line-height:1.25;color:${BRAND_NAVY};font-weight:800;">New website enquiry</h1>
              <p style="margin:14px 0 0;font-size:15px;line-height:1.65;color:#334155;">A visitor submitted the <strong style="color:${BRAND_BLUE};">Auto Verifi</strong> contact form. Reply directly to this email to reach them.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#eff6ff;padding:22px 32px;border-left:1px solid #dbeafe;border-right:1px solid #dbeafe;">
              <h2 style="margin:0 0 12px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND_BLUE};">Submission details</h2>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #bfdbfe;border-radius:10px;border-collapse:separate;overflow:hidden;background:#ffffff;">
                ${rows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:22px 32px;border-left:1px solid #dbeafe;border-right:1px solid #dbeafe;">
              <h2 style="margin:0 0 10px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND_BLUE};">Message</h2>
              <div style="border:1px solid #e2e8f0;border-radius:10px;background:#f8fafc;padding:16px 18px;font-size:14px;line-height:1.65;color:${BRAND_NAVY};">${messageHtml}</div>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:22px 32px;border-radius:0 0 14px 14px;border:1px solid #dbeafe;border-top:0;">
              <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#475569;">Delivered to <a href="mailto:${escapeHtml(company.email)}" style="color:${BRAND_BLUE};font-weight:700;text-decoration:none;">${escapeHtml(company.email)}</a></p>
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
