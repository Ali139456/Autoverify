import { getCompanyDetails, formatCompanyFooterLines } from "./company";
import { PRE_PURCHASE_INSPECTIONS_HREF } from "./inspection-menu";
import { formatReportReference } from "./report-design";
import { formatTierPrice, getReportTierConfig, resolveReportTier } from "./pricing";
import type { VehicleReport } from "./types";

const BRAND_BLUE = "#0073E3";
const BRAND_NAVY = "#0f172a";
const ACCENT_ORANGE = "#E87722";

export type PurchaseEmailContext = {
  customerName?: string | null;
  reportUrl: string;
  pdfUrl: string;
  invoiceHostedUrl?: string | null;
  invoicePdfUrl?: string | null;
  invoiceNumber?: string | null;
  amountPaidCents?: number | null;
  currency?: string | null;
  paidAt?: Date;
};

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

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function greetingName(raw?: string | null): string {
  const trimmed = raw?.trim();
  if (!trimmed) return "there";
  const first = trimmed.split(/\s+/)[0];
  return first || "there";
}

export function buildPurchaseConfirmationEmailHtml(
  report: VehicleReport,
  ctx: PurchaseEmailContext,
  baseUrl: string,
): string {
  const vehicleLabel = `${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}`.trim();
  const tier = resolveReportTier(report.tier);
  const tierConfig = getReportTierConfig(tier);
  const generatedOn = formatAuDate(ctx.paidAt ?? new Date(report.createdAt));
  const company = getCompanyDetails(baseUrl);
  const footerLines = formatCompanyFooterLines(company).map(escapeHtml);

  const logoWhiteUrl = `${baseUrl.replace(/\/$/, "")}/logo/logo-white.png`;
  const logoFooterUrl = `${baseUrl.replace(/\/$/, "")}/logo/logo-white.png`;

  const currency = (ctx.currency ?? "aud").toLowerCase();
  const amountCents = ctx.amountPaidCents ?? tierConfig.priceCents;
  const amountLabel = formatMoney(amountCents, currency);
  const rrpCents = tierConfig.priceCents;
  const isPromoOrFree = amountCents < rrpCents;
  const rrpLabel = `${formatTierPrice(tier)} RRP`;
  const purchaseAmountLine = isPromoOrFree
    ? `Purchase amount: ${amountLabel} (${rrpLabel}).`
    : `Purchase amount: ${amountLabel}.`;

  const inspectionsUrl = `${baseUrl.replace(/\/$/, "")}${PRE_PURCHASE_INSPECTIONS_HREF}`;
  const privacyUrl = `${baseUrl.replace(/\/$/, "")}/privacy`;
  const termsUrl = `${baseUrl.replace(/\/$/, "")}/terms`;

  const invoiceRows = [
    ["Description", tierConfig.name],
    ["Vehicle", vehicleLabel],
    [
      "Identifier",
      report.vehicle.rego
        ? `${report.vehicle.rego} (${report.vehicle.state})`
        : report.vehicle.vin || "—",
    ],
    ["Amount (incl.GST)", amountLabel],
  ];
  if (ctx.invoiceNumber) {
    invoiceRows.unshift(["Tax invoice no.", ctx.invoiceNumber]);
  }
  invoiceRows.push(["Report reference", formatReportReference(report.vehicle)]);

  const invoiceTable = invoiceRows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:11px 14px;border-bottom:1px solid #dbeafe;color:#475569;font-size:13px;width:40%;background:#f8fafc;">${escapeHtml(label)}</td>
          <td style="padding:11px 14px;border-bottom:1px solid #dbeafe;color:${BRAND_NAVY};font-size:13px;font-weight:700;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  const purchaseAmountParagraph = `<p style="margin:14px 0 0;font-size:13px;color:#334155;line-height:1.55;">
        ${escapeHtml(purchaseAmountLine)}
      </p>`;

  const invoiceLinkBlock = ctx.invoiceHostedUrl
    ? `<p style="margin:14px 0 0;font-size:13px;color:#334155;line-height:1.55;">
        Your official tax invoice PDF is attached. You can also
        <a href="${escapeHtml(ctx.invoiceHostedUrl)}" style="color:${BRAND_BLUE};font-weight:700;text-decoration:none;">view your invoice online</a>.
      </p>${isPromoOrFree ? purchaseAmountParagraph : ""}`
    : purchaseAmountParagraph;

  const nextStepRow = (
    title: string,
    href: string,
    desc: string,
    last = false,
  ) => `
    <tr>
      <td style="padding:14px 16px;${last ? "" : "border-bottom:1px solid #e2e8f0;"}">
        <a href="${escapeHtml(href)}" style="font-size:14px;font-weight:700;color:${BRAND_BLUE};text-decoration:none;">${escapeHtml(title)}</a>
        <p style="margin:5px 0 0;font-size:13px;line-height:1.5;color:#64748b;">${escapeHtml(desc)}</p>
      </td>
    </tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Your Auto Verifi report</title>
</head>
<body style="margin:0;padding:0;background:#e8eef5;font-family:Arial,Helvetica,sans-serif;color:#334155;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#e8eef5;padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" width="620" style="max-width:620px;width:100%;border-collapse:separate;border-spacing:0;">
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND_BLUE} 0%, #005bb5 100%);padding:26px 32px 22px;border-radius:14px 14px 0 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <img src="${escapeHtml(logoWhiteUrl)}" alt="Auto Verifi" width="190" height="36" style="display:block;height:36px;width:auto;max-width:200px;" />
                    <p style="margin:8px 0 0;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Past &nbsp;|&nbsp; Present &nbsp;|&nbsp; Future</p>
                  </td>
                  <td align="right" valign="top" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:rgba(255,255,255,0.9);line-height:1.6;">
                    Generated<br />${escapeHtml(generatedOn)}<br />
                    <span style="font-weight:600;opacity:0.85;">${escapeHtml(company.website)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:0 32px;border-left:1px solid #dbeafe;border-right:1px solid #dbeafe;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px 0 8px;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;">Vehicle history report</p>
                    <h1 style="margin:6px 0 0;font-size:24px;line-height:1.25;color:${BRAND_NAVY};font-weight:800;">Auto Verifi Report &amp; PPSR Certificate</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:0 32px 28px;border-left:1px solid #dbeafe;border-right:1px solid #dbeafe;">
              <p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:${BRAND_NAVY};">Dear ${escapeHtml(greetingName(ctx.customerName))},</p>
              <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">
                Thank you for choosing <strong style="color:${BRAND_BLUE};">Auto Verifi</strong>.
                Your report for <strong>${escapeHtml(vehicleLabel)}</strong> is ready — the PDF report and tax invoice are attached to this email.
              </p>
              <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#334155;">
                Open your interactive report online anytime, or download the PDF again using the buttons below.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:10px;">
                    <a href="${escapeHtml(ctx.reportUrl)}" style="display:inline-block;background:${ACCENT_ORANGE};color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;padding:13px 24px;border-radius:10px;">View report online</a>
                  </td>
                  <td>
                    <a href="${escapeHtml(ctx.pdfUrl)}" style="display:inline-block;background:#ffffff;color:${BRAND_BLUE};font-size:14px;font-weight:800;text-decoration:none;padding:12px 22px;border-radius:10px;border:2px solid ${BRAND_BLUE};">Download PDF</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#eff6ff;padding:22px 32px;border-left:1px solid #dbeafe;border-right:1px solid #dbeafe;">
              <h2 style="margin:0 0 12px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND_BLUE};">Tax invoice summary</h2>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #bfdbfe;border-radius:10px;border-collapse:separate;overflow:hidden;background:#ffffff;">
                ${invoiceTable}
              </table>
              ${invoiceLinkBlock}
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:22px 32px;border-left:1px solid #dbeafe;border-right:1px solid #dbeafe;">
              <h2 style="margin:0 0 10px;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${BRAND_BLUE};">Need help reading your report?</h2>
              <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#475569;">
                Contact our team at
                <a href="mailto:${escapeHtml(company.email)}" style="color:${BRAND_BLUE};font-weight:700;text-decoration:none;">${escapeHtml(company.email)}</a>
              </p>
              <p style="margin:0;font-size:13px;">
                <a href="${escapeHtml(termsUrl)}" style="color:${BRAND_BLUE};font-weight:600;">Terms of use</a>
                &nbsp;&middot;&nbsp;
                <a href="${escapeHtml(privacyUrl)}" style="color:${BRAND_BLUE};font-weight:600;">Privacy</a>
                &nbsp;&middot;&nbsp;
                <a href="mailto:${escapeHtml(company.email)}" style="color:${BRAND_BLUE};font-weight:600;">Support</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:22px 32px;border-left:1px solid #dbeafe;border-right:1px solid #dbeafe;">
              <h2 style="margin:0 0 14px;font-size:16px;font-weight:800;color:${BRAND_NAVY};">Next steps to purchase</h2>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;">
                ${nextStepRow(
                  "Pre-Purchase inspection",
                  inspectionsUrl,
                  "Book a professional inspection through Auto Verifi before you buy.",
                )}
                ${nextStepRow(
                  "Payment escrow",
                  "https://veme.me",
                  "Secure your payment with an independent escrow service.",
                )}
                ${nextStepRow(
                  "Registration and transport",
                  "https://nexttransport.com.au",
                  "Arrange registration transfers and vehicle transport.",
                  true,
                )}
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:${BRAND_NAVY};padding:26px 32px;border-radius:0 0 14px 14px;border:1px solid ${BRAND_NAVY};">
              <img src="${escapeHtml(logoFooterUrl)}" alt="Auto Verifi" width="180" height="40" style="display:block;height:40px;width:auto;max-width:200px;" />
              <p style="margin:16px 0 12px;font-size:11px;line-height:1.65;color:#94a3b8;">
                This report is compiled from third-party data sources and is provided for information only.
                It is not personal financial, legal or tax advice. You should make your own enquiries before purchasing a vehicle.
              </p>
              <p style="margin:0;font-size:12px;line-height:1.75;color:#94a3b8;">
                ${footerLines.join("<br />")}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
