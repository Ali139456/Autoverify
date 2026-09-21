import { getBaseUrl } from "./stripe";
import type { VehicleReport } from "./types";

export async function sendPurchaseConfirmationEmail(
  report: VehicleReport,
  email: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return;

  const from =
    process.env.RESEND_FROM?.trim() ??
    "Auto Verifi <noreply@autoverifi.com.au>";
  const baseUrl = getBaseUrl();
  const reportUrl = `${baseUrl}/report/${report.id}`;
  const pdfUrl = `${baseUrl}/api/report/${report.id}/pdf`;
  const vehicleLabel = `${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: `Your Auto Verifi report — ${vehicleLabel}`,
      html: `
        <p>Thanks for your purchase.</p>
        <p>Your Auto Verifi report for <strong>${vehicleLabel}</strong> is ready.</p>
        <p><a href="${reportUrl}">View your report online</a></p>
        <p><a href="${pdfUrl}">Download PDF</a></p>
        <p>Auto Verifi Pty Ltd</p>
      `,
    }),
  });
}
