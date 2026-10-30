import { getCompanyDetails } from "@/lib/company";
import {
  PURCHASE_EMAIL_FOOTER_LOGO_HEIGHT,
  PURCHASE_EMAIL_FOOTER_LOGO_WIDTH,
  PURCHASE_EMAIL_HEADER_LOGO_HEIGHT,
  PURCHASE_EMAIL_HEADER_LOGO_WIDTH,
  REPORT_LOGO_PNG_PATH,
  REPORT_LOGO_OBJECT_POSITION,
} from "@/lib/report-logo-size";

export const BRANDED_EMAIL_BLUE = "#0073E3";
export const BRANDED_EMAIL_NAVY = "#0f172a";
export const BRANDED_EMAIL_ORANGE = "#E87722";

export function escapeBrandedEmailHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatBrandedEmailDateTime(date: Date): string {
  return date.toLocaleString("en-AU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export type BrandedEmailCta = {
  label: string;
  href: string;
  primary?: boolean;
};

/** Shared Auto Verifi transactional email shell (logo, footer, optional CTAs). */
export function buildBrandedEmailLayout(input: {
  baseUrl: string;
  eyebrow: string;
  title: string;
  introHtml: string;
  bodyHtml?: string;
  ctas?: BrandedEmailCta[];
  headerMetaLabel?: string;
  headerMetaAt?: Date;
  footerNoteHtml?: string;
}): string {
  const {
    baseUrl,
    eyebrow,
    title,
    introHtml,
    bodyHtml = "",
    ctas = [],
    headerMetaLabel = "Sent",
    headerMetaAt = new Date(),
    footerNoteHtml,
  } = input;

  const company = getCompanyDetails(baseUrl);
  const logoUrl = `${baseUrl.replace(/\/$/, "")}${REPORT_LOGO_PNG_PATH}`;
  const privacyUrl = `${baseUrl.replace(/\/$/, "")}/privacy`;
  const termsUrl = `${baseUrl.replace(/\/$/, "")}/terms`;

  const ctaBlock =
    ctas.length > 0
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0 0;">
${ctas
  .map(
    (cta) => `
  <tr>
    <td style="padding:0 10px 10px 0;">
      <a href="${escapeBrandedEmailHtml(cta.href)}" style="display:inline-block;background:${cta.primary !== false ? BRANDED_EMAIL_ORANGE : "transparent"};color:${cta.primary !== false ? "#ffffff" : BRANDED_EMAIL_BLUE};font-size:14px;font-weight:800;text-decoration:none;padding:12px 22px;border-radius:10px;border:2px solid ${cta.primary !== false ? BRANDED_EMAIL_ORANGE : BRANDED_EMAIL_BLUE};">${escapeBrandedEmailHtml(cta.label)}</a>
    </td>
  </tr>`,
  )
  .join("")}
</table>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeBrandedEmailHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#e8eef5;font-family:Arial,Helvetica,sans-serif;color:#334155;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#e8eef5;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="620" style="max-width:620px;width:100%;border-collapse:separate;border-spacing:0;">
          <tr>
            <td style="background:#ffffff;padding:26px 32px 18px;border-radius:14px 14px 0 0;border:1px solid #dbeafe;border-bottom:3px solid ${BRANDED_EMAIL_BLUE};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" valign="top">
                    <img src="${escapeBrandedEmailHtml(logoUrl)}" alt="Auto Verifi" width="${PURCHASE_EMAIL_HEADER_LOGO_WIDTH}" height="${PURCHASE_EMAIL_HEADER_LOGO_HEIGHT}" style="display:block;border:0;height:${PURCHASE_EMAIL_HEADER_LOGO_HEIGHT}px!important;width:auto!important;max-width:${PURCHASE_EMAIL_HEADER_LOGO_WIDTH}px!important;object-fit:contain;object-position:${REPORT_LOGO_OBJECT_POSITION};" />
                    <p style="margin:10px 0 0;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${BRANDED_EMAIL_BLUE};">${escapeBrandedEmailHtml(eyebrow)}</p>
                  </td>
                  <td align="right" valign="top" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;line-height:1.6;">
                    ${escapeBrandedEmailHtml(headerMetaLabel)}<br />${escapeBrandedEmailHtml(formatBrandedEmailDateTime(headerMetaAt))}<br />
                    <a href="${escapeBrandedEmailHtml(company.websiteUrl)}" style="color:${BRANDED_EMAIL_BLUE};font-weight:700;text-decoration:none;text-transform:none;">${escapeBrandedEmailHtml(company.website)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:24px 32px 8px;border-left:1px solid #dbeafe;border-right:1px solid #dbeafe;">
              <h1 style="margin:0;font-size:24px;line-height:1.25;color:${BRANDED_EMAIL_NAVY};font-weight:800;">${escapeBrandedEmailHtml(title)}</h1>
              <div style="margin:14px 0 0;font-size:15px;line-height:1.65;color:#334155;">${introHtml}</div>
              ${bodyHtml ? `<div style="margin:16px 0 0;font-size:15px;line-height:1.65;color:#334155;">${bodyHtml}</div>` : ""}
              ${ctaBlock}
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:22px 32px;border-radius:0 0 14px 14px;border:1px solid #dbeafe;border-top:0;">
              ${footerNoteHtml ? `<p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#475569;">${footerNoteHtml}</p>` : ""}
              <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#475569;">Questions? Email <a href="mailto:${escapeBrandedEmailHtml(company.email)}" style="color:${BRANDED_EMAIL_BLUE};font-weight:700;text-decoration:none;">${escapeBrandedEmailHtml(company.email)}</a></p>
              <p style="margin:0;font-size:13px;">
                <a href="${escapeBrandedEmailHtml(termsUrl)}" style="color:${BRANDED_EMAIL_BLUE};font-weight:600;">Terms of use</a>
                &nbsp;&middot;&nbsp;
                <a href="${escapeBrandedEmailHtml(privacyUrl)}" style="color:${BRANDED_EMAIL_BLUE};font-weight:600;">Privacy</a>
              </p>
              <img src="${escapeBrandedEmailHtml(logoUrl)}" alt="" width="${PURCHASE_EMAIL_FOOTER_LOGO_WIDTH}" height="${PURCHASE_EMAIL_FOOTER_LOGO_HEIGHT}" style="display:block;margin:16px 0 0;border:0;opacity:0.85;height:${PURCHASE_EMAIL_FOOTER_LOGO_HEIGHT}px!important;width:auto!important;max-width:${PURCHASE_EMAIL_FOOTER_LOGO_WIDTH}px!important;" />
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
