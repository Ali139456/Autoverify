import {
  buildContactFormNotificationEmailHtml,
  type ContactFormEmailPayload,
} from "./contact-email-template";
import {
  buildInspectionDamageFollowUpEmailHtml,
  buildInspectionPhotosUpdatedEmailHtml,
} from "./inspection-notification-email-template";
import {
  buildPurchaseConfirmationEmailHtml,
  type PurchaseEmailContext,
} from "./purchase-email-template";
import { getContactInboxEmail } from "./site-contact";
import { fetchPpsrCertificateForPurchaseEmail } from "./ppsr-certificate";
import { generateReportPdfBuffer } from "./report-pdf-buffer";
import { generateTaxInvoicePdfBuffer } from "./tax-invoice-pdf-buffer";
import { buildPurchaseEmailContextFromSession } from "./stripe-purchase-email";
import { getBaseUrl } from "./stripe";
import { parseInspectorLiteCodeFromUrl } from "./ravin-partner";
import { formatReportVehicleLabel } from "./report-design";
import { buildReportPublicUrls } from "./ravin-report-trace";
import type { InspectionSession, VehicleReport } from "./types";

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
          ...buildReportPublicUrls(baseUrl, report.id),
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
  const { reportUrl, pdfUrl } = buildReportPublicUrls(baseUrl, report.id);
  const vehicleLabel = formatReportVehicleLabel(report);
  const rego = report.vehicle.rego?.trim();
  const regoSuffix = rego ? ` (${rego})` : "";
  const damageAnalysisReady =
    options?.damageAnalysisReady ?? Boolean(report.damage);
  const isLav = Boolean(report.lavContext);

  const subject = isLav
    ? damageAnalysisReady
      ? `Lender asset verification report updated — ${vehicleLabel}${regoSuffix}`
      : `Digital Self Inspection photos received — ${vehicleLabel}${regoSuffix}`
    : damageAnalysisReady
      ? `Inspection photos added — ${vehicleLabel}${regoSuffix}`
      : `AI damage analysis still processing — ${vehicleLabel}${regoSuffix}`;

  const html = buildInspectionPhotosUpdatedEmailHtml({
    isLav,
    damageAnalysisReady,
    vehicleLabel,
    regoSuffix,
    reportUrl,
    pdfUrl,
    baseUrl,
  });

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

/** ~30 minutes after AI damage analysis completes — updated report + PDF attachment. */
export async function sendInspectionDamageFollowUpEmail(
  report: VehicleReport,
  email: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn(
      "[email] RESEND_API_KEY not set — skipping damage follow-up email.",
    );
    return;
  }

  const from =
    process.env.RESEND_FROM?.trim() ??
    "Auto Verifi <noreply@autoverifi.com.au>";
  const baseUrl = getBaseUrl();
  const { reportUrl, pdfUrl } = buildReportPublicUrls(baseUrl, report.id);
  const vehicleLabel = formatReportVehicleLabel(report);
  const rego = report.vehicle.rego?.trim();
  const regoSuffix = rego ? ` (${rego})` : "";
  const damageReady = Boolean(
    report.damageAnalysisCompletedAt || report.damage,
  );
  const isLav = Boolean(report.lavContext);

  const subject = isLav
    ? `Your lender asset verification report is ready — ${vehicleLabel}${regoSuffix}`
    : `Your Auto Verifi report is ready — AI analysis complete — ${vehicleLabel}${regoSuffix}`;

  const html = buildInspectionDamageFollowUpEmailHtml({
    isLav,
    damageReady,
    vehicleLabel,
    regoSuffix,
    reportUrl,
    pdfUrl,
    baseUrl,
    pdfAttached: true,
  });

  const attachments: { filename: string; content: string }[] = [];
  try {
    const reportPdf = await generateReportPdfBuffer(report);
    attachments.push({
      filename: `Auto-Verifi-Report-${report.vehicle.rego || report.id}.pdf`,
      content: reportPdf.toString("base64"),
    });
  } catch {
    // PDF optional
  }

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
      attachments: attachments.length > 0 ? attachments : undefined,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Resend damage follow-up failed (${response.status}): ${body.slice(0, 200)}`,
    );
  }
}

/** Ops inbox when Ravin damage is still missing long after S3 ingest. */
export async function sendRavinStuckOpsAlert(input: {
  report: VehicleReport;
  inspection: InspectionSession;
  webhookCount: number;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to =
    process.env.AUTOVERIFI_SUPPORT_EMAIL?.trim() ||
    getContactInboxEmail();
  if (!apiKey || !to) {
    console.warn(
      "[email] RESEND_API_KEY or support inbox missing — skipping Ravin stuck alert.",
    );
    return;
  }

  const from =
    process.env.RESEND_FROM?.trim() ??
    "Auto Verifi <noreply@autoverifi.com.au>";
  const baseUrl = getBaseUrl();
  const { reportUrl } = buildReportPublicUrls(baseUrl, input.report.id);
  const vehicleLabel = `${input.report.vehicle.year} ${input.report.vehicle.make} ${input.report.vehicle.model}`;
  const rego = input.report.vehicle.rego?.trim();
  const sessionCode = input.inspection.ravinInviteUrl
    ? parseInspectorLiteCodeFromUrl(input.inspection.ravinInviteUrl)
    : null;

  const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#0f172a;line-height:1.55">
<p><strong>Ravin damage still missing</strong> (automatic ops alert)</p>
<p><strong>Report:</strong> <a href="${reportUrl}">${input.report.id}</a><br/>
<strong>Vehicle:</strong> ${vehicleLabel}${rego ? ` (${rego})` : ""}<br/>
<strong>Inspection completed:</strong> ${input.inspection.completedAt ?? "—"}<br/>
<strong>Ravin claimId:</strong> ${input.inspection.ravinInspectionId ?? input.report.id}<br/>
<strong>Ravin session code:</strong> ${sessionCode ?? "—"}<br/>
<strong>Webhooks stored for this report:</strong> ${input.webhookCount}</p>
<p>Auto Verifi already uploaded photos to Ravin S3. Ask Ravin to confirm ingest and re-send <code>sendEventReport</code> to <code>${baseUrl}/api/webhooks/ravin</code>.</p>
</body></html>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Ravin stuck — ${input.report.id} (${vehicleLabel})`,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Resend Ravin stuck alert failed (${response.status}): ${body.slice(0, 200)}`,
    );
  }
}

export type ContactFormPayload = ContactFormEmailPayload;

/** Delivers Contact us form submissions to the Auto Verifi inbox via Resend. */
export async function sendContactFormEmail(
  payload: ContactFormPayload,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Contact email is not configured.");
  }

  const from =
    process.env.RESEND_FROM?.trim() ??
    "Auto Verifi <noreply@autoverifi.com.au>";
  const to = getContactInboxEmail();
  const baseUrl = getBaseUrl();
  const html = buildContactFormNotificationEmailHtml({
    payload,
    baseUrl,
    receivedAt: new Date(),
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: payload.email.trim(),
      subject: `Auto Verifi contact — ${payload.subject?.trim() || payload.name.trim()}`,
      html,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Resend contact email failed (${response.status}): ${body.slice(0, 200)}`,
    );
  }
}
