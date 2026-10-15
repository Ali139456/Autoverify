import {
  buildPurchaseConfirmationEmailHtml,
  type PurchaseEmailContext,
} from "./purchase-email-template";
import { fetchPpsrCertificateForPurchaseEmail } from "./ppsr-certificate";
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

  try {
    const ppsrPdf = await fetchPpsrCertificateForPurchaseEmail(report);
    if (ppsrPdf) {
      attachments.push({
        filename: `PPSR-Certificate-${report.vehicle.rego || report.vehicle.vin || report.id}.pdf`,
        content: ppsrPdf.toString("base64"),
      });
    }
  } catch {
    // PPSR attachment is optional; combined report PDF may still include it.
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

/** Buyer + ops inbox when walkaround photos are submitted. */
export function getInspectionPhotoNotifyEmails(
  report: VehicleReport,
): string[] {
  const emails = new Set<string>();
  const customer = report.customerEmail?.trim().toLowerCase();
  if (customer) emails.add(customer);
  const support = process.env.AUTOVERIFI_SUPPORT_EMAIL?.trim().toLowerCase();
  if (support) emails.add(support);
  return [...emails];
}

/** Sent when walkaround photos are submitted (Insights+). */
export async function sendInspectionPhotosUpdatedEmail(
  report: VehicleReport,
  email: string,
  options?: { damageAnalysisReady?: boolean },
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY not set — skipping inspection photos email.",
    );
    return;
  }

  const from =
    process.env.RESEND_FROM?.trim() ??
    "Auto Verifi <noreply@autoverifi.com.au>";
  const baseUrl = getBaseUrl();
  const reportUrl = `${baseUrl}/report/${report.id}`;
  const pdfUrl = `${baseUrl}/api/report/${report.id}/pdf`;
  const vehicleLabel = `${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}`;
  const rego = report.vehicle.rego?.trim();
  const regoSuffix = rego ? ` (${rego})` : "";
  const damageAnalysisReady =
    options?.damageAnalysisReady ?? Boolean(report.damage);

  const subject = damageAnalysisReady
    ? `Inspection photos added — ${vehicleLabel}${regoSuffix}`
    : `AI damage analysis still processing — ${vehicleLabel}${regoSuffix}`;

  const html = damageAnalysisReady
    ? `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#0f172a;line-height:1.5">
<p>Inspection photos for <strong>${vehicleLabel}</strong>${regoSuffix} have been added to your Auto Verifi Insights+ report.</p>
<p><a href="${reportUrl}">View your report online</a> · <a href="${pdfUrl}">Download PDF</a></p>
</body></html>`
    : `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#0f172a;line-height:1.5">
<p>Your guided inspection photos for <strong>${vehicleLabel}</strong>${regoSuffix} are saved on your Auto Verifi Insights+ report.</p>
<p><strong>AI damage analysis is still processing.</strong> Damage detection results will appear on your report automatically when ready — we will not send a separate email when that finishes.</p>
<p><a href="${reportUrl}">View your report online</a> · <a href="${pdfUrl}">Download PDF</a></p>
</body></html>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Resend inspection email failed (${response.status}): ${body.slice(0, 200)}`,
    );
  }
}
