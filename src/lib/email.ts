import {
  buildPurchaseConfirmationEmailHtml,
  type PurchaseEmailContext,
} from "./purchase-email-template";
import { fetchPpsrCertificateForReport, hasPpsrCertificate } from "./ppsr-certificate";
import { generateReportPdfBuffer } from "./report-pdf-buffer";
import { generateTaxInvoicePdfBuffer } from "./tax-invoice-pdf-buffer";
import { buildPurchaseEmailContextFromSession } from "./stripe-purchase-email";
import { getBaseUrl } from "./stripe";
import type { VehicleReport } from "./types";

export type SendPurchaseConfirmationOptions = {
  stripeSessionId?: string | null;
  emailContext?: PurchaseEmailContext;
};

export async function sendPurchaseConfirmationEmail(
  report: VehicleReport,
  email: string,
  options: SendPurchaseConfirmationOptions = {},
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return;

  const from =
    process.env.RESEND_FROM?.trim() ??
    "Auto Verifi <noreply@autoverifi.com.au>";
  const baseUrl = getBaseUrl();

  const ctx =
    options.emailContext ??
    (options.stripeSessionId
      ? await buildPurchaseEmailContextFromSession(
          options.stripeSessionId,
          baseUrl,
          report.id,
        )
      : {
          reportUrl: `${baseUrl}/report/${report.id}`,
          pdfUrl: `${baseUrl}/api/report/${report.id}/pdf`,
          paidAt: new Date(),
        });

  const vehicleLabel = `${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}`;
  const html = buildPurchaseConfirmationEmailHtml(report, ctx, baseUrl);

  const attachments: { filename: string; content?: string; path?: string }[] =
    [];

  try {
    const reportPdf = await generateReportPdfBuffer(report);
    attachments.push({
      filename: `Auto-Verifi-Report-${report.vehicle.rego || report.id}.pdf`,
      content: reportPdf.toString("base64"),
    });
  } catch {
    // Report PDF is optional if rendering fails; email still sends with links.
  }

  try {
    const invoicePdf = await generateTaxInvoicePdfBuffer(report, ctx);
    attachments.push({
      filename: "Auto-Verifi-Tax-Invoice.pdf",
      content: invoicePdf.toString("base64"),
    });
  } catch {
    if (ctx.invoicePdfUrl) {
      attachments.push({
        filename: "Auto-Verifi-Tax-Invoice.pdf",
        path: ctx.invoicePdfUrl,
      });
    }
  }

  if (hasPpsrCertificate(report)) {
    try {
      const ppsrPdf = await fetchPpsrCertificateForReport(report);
      if (ppsrPdf) {
        attachments.push({
          filename: `PPSR-Certificate-${report.vehicle.rego || report.vehicle.vin || report.id}.pdf`,
          content: ppsrPdf.toString("base64"),
        });
      }
    } catch {
      // PPSR attachment is optional; combined report PDF may still include it.
    }
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: `Your Auto Verifi report & tax invoice — ${vehicleLabel}`,
      html,
      attachments: attachments.length > 0 ? attachments : undefined,
    }),
  });
}
