import { getCompanyDetails } from "./company";
import {
  PURCHASE_EMAIL_FOOTER_LOGO_HEIGHT,
  PURCHASE_EMAIL_FOOTER_LOGO_WIDTH,
  PURCHASE_EMAIL_HEADER_LOGO_HEIGHT,
  PURCHASE_EMAIL_HEADER_LOGO_WIDTH,
  REPORT_LOGO_PNG_PATH,
  REPORT_LOGO_OBJECT_POSITION,
} from "./report-logo-size";
import { hasPpsrCertificate } from "./ppsr-certificate";
import { formatReportReference } from "./report-design";
import {
  formatTierPrice,
  getReportTierConfig,
  resolveReportTier,
} from "./pricing";
import type { ReportTier, VehicleReport } from "./types";

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
  /** Tier list price (inc. GST) before promo — for tax invoice line items. */
  listPriceCents?: number | null;
  promoCode?: string | null;
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

function purchaseEmailReportHeading(tier: ReportTier, includePpsr: boolean): string {
  const productName =
    tier === "insights_plus"
      ? "Auto Verifi Insights+ Report"
      : "Auto Verifi Insights Report";
  return includePpsr ? `${productName} & PPSR Certificate` : productName;
}

function buildEmailFooterContactHtml(
  company: ReturnType<typeof getCompanyDetails>,
): string {
  const lines = [escapeHtml(company.legalName)];
  if (company.abn.trim()) {
    lines.push(`ABN ${escapeHtml(formatAbnPlain(company.abn))}`);
  }
  lines.push(escapeHtml(company.address));
  lines.push(
    `<a href="mailto:${escapeHtml(company.email)}" style="color:#475569;text-decoration:none;">${escapeHtml(company.email)}</a>`,
  );
  lines.push(
    `<a href="${escapeHtml(company.websiteUrl)}" style="color:#475569;text-decoration:none;">${escapeHtml(company.website)}</a>`,
  );
  return lines.join("<br />");
}

function formatAbnPlain(abn: string): string {
  const digits = abn.replace(/\D/g, "");
  if (digits.length !== 11) return abn.trim();
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 11)}`;
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
  const includePpsr = hasPpsrCertificate(report);
  const reportHeading = purchaseEmailReportHeading(tier, includePpsr);
  const footerContactHtml = buildEmailFooterContactHtml(company);

  const logoUrl = `${baseUrl.replace(/\/$/, "")}${REPORT_LOGO_PNG_PATH}`;
  const logoHeaderUrl = logoUrl;
  const logoFooterUrl = logoUrl;

  const currency = (ctx.currency ?? "aud").toLowerCase();
  const amountCents = ctx.amountPaidCents ?? tierConfig.priceCents;
  const amountLabel = formatMoney(amountCents, currency);
  const rrpCents = tierConfig.priceCents;
  const isPromoOrFree = amountCents < rrpCents;
  const rrpLabel = `${formatTierPrice(tier)} RRP`;
  const purchaseAmountLine = isPromoOrFree
    ? `Purchase amount: ${amountLabel} (${rrpLabel}).`
    : `Purchase amount: ${amountLabel}.`;

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
    href: string | null,
    desc: string,
    last = false,
  ) => `
    <tr>
      <td style="padding:14px 16px;${last ? "" : "border-bottom:1px solid #e2e8f0;"}">
        <span style="font-size:14px;font-weight:700;color:${BRAND_NAVY};">${escapeHtml(title)}</span>
        <p style="margin:5px 0 0;font-size:13px;line-height:1.5;color:#64748b;">${escapeHtml(desc)}</p>
        ${
          href
            ? `<p style="margin:6px 0 0;font-size:13px;"><a href="${escapeHtml(href)}" style="font-weight:700;color:${BRAND_BLUE};text-decoration:underline;">${escapeHtml(href.replace(/^https?:\/\//, ""))}</a></p>`
            : ""
        }
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
            <td style="background:#ffffff;padding:26px 32px 18px;border-radius:14px 14px 0 0;border:1px solid #dbeafe;border-bottom:3px solid ${BRAND_BLUE};">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="text-align:left;vertical-align:top;">
                    <img src="${escapeHtml(logoHeaderUrl)}" alt="Auto Verifi" width="${PURCHASE_EMAIL_HEADER_LOGO_WIDTH}" height="${PURCHASE_EMAIL_HEADER_LOGO_HEIGHT}" style="display:block;margin:0;border:0;outline:none;text-decoration:none;height:${PURCHASE_EMAIL_HEADER_LOGO_HEIGHT}px!important;width:auto!important;max-width:${PURCHASE_EMAIL_HEADER_LOGO_WIDTH}px!important;object-fit:contain;object-position:${REPORT_LOGO_OBJECT_POSITION};-ms-interpolation-mode:bicubic;" />
                    <p style="margin:10px 0 0;padding:0;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:${BRAND_BLUE};text-align:left;">Past &nbsp;|&nbsp; Present &nbsp;|&nbsp; Future Vehicle Insights</p>
                  </td>
                  <td align="right" valign="top" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;line-height:1.6;">
                    Generated<br />${escapeHtml(generatedOn)}<br />
                    <span style="font-weight:600;color:${BRAND_BLUE};">${escapeHtml(company.website)}</span>
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
                    <h1 style="margin:0;font-size:24px;line-height:1.25;color:${BRAND_NAVY};font-weight:800;">${escapeHtml(reportHeading)}</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:0 32px 28px;border-left:1px solid #dbeafe;border-right:1px solid #dbeafe;">
              <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#334155;">
                Thank you for choosing <strong style="color:${BRAND_BLUE};">Auto Verifi</strong>.
                Your <strong>${escapeHtml(reportHeading)}</strong> for <strong>${escapeHtml(vehicleLabel)}</strong> is ready — your PDF report and tax invoice are attached.
              </p>
              <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#334155;">
                View the full interactive report online or download the PDF again using the buttons below.
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
                  "Pre-purchase inspection",
                  null,
                  "Book a professional inspection before you buy (use Google to research a credible mobile pre-purchase inspections provider).",
                )}
                ${nextStepRow(
                  "Payment escrow",
                  "https://www.veme.me",
                  "Secure your payment with an independent escrow service.",
                )}
                ${nextStepRow(
                  "Registration and transport",
                  "https://www.intraffic.com.au",
                  "Arrange registration transfers and vehicle transport.",
                  true,
                )}
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;padding:26px 32px;border-radius:0 0 14px 14px;border:1px solid #dbeafe;border-top:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="padding-bottom:12px;border-bottom:2px solid ${BRAND_BLUE};text-align:left;">
                    <img src="${escapeHtml(logoFooterUrl)}" alt="Auto Verifi" width="${PURCHASE_EMAIL_FOOTER_LOGO_WIDTH}" height="${PURCHASE_EMAIL_FOOTER_LOGO_HEIGHT}" style="display:block;margin:0;border:0;outline:none;text-decoration:none;height:${PURCHASE_EMAIL_FOOTER_LOGO_HEIGHT}px!important;width:auto!important;max-width:${PURCHASE_EMAIL_FOOTER_LOGO_WIDTH}px!important;object-fit:contain;object-position:${REPORT_LOGO_OBJECT_POSITION};-ms-interpolation-mode:bicubic;" />
                    <p style="margin:8px 0 0;padding:0;font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:${BRAND_BLUE};text-align:left;">Past &nbsp;|&nbsp; Present &nbsp;|&nbsp; Future Vehicle Insights</p>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 12px;font-size:11px;line-height:1.65;color:#64748b;">
                This report is compiled from third-party data sources and is provided for information only.
                It is not personal financial, legal or tax advice. You should make your own enquiries before purchasing a vehicle.
              </p>
              <p style="margin:0;font-size:12px;line-height:1.75;color:#475569;">
                ${footerContactHtml}
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
