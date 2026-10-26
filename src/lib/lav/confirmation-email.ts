import { getContactInboxEmail } from "@/lib/site-contact";
import { getBaseUrl } from "@/lib/stripe";
import { buildReportPublicUrls } from "@/lib/ravin-report-trace";
import { buildLavBookingConfirmationEmailHtml } from "./confirmation-email-template";
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

  const reportLinks = assetReportIds.map((id) => {
    const urls = buildReportPublicUrls(baseUrl, id);
    return { id, reportUrl: urls.reportUrl, pdfUrl: urls.pdfUrl };
  });

  const html = buildLavBookingConfirmationEmailHtml({
    payload,
    captureLinks,
    reportLinks,
    invoiceAccount,
    digital,
    baseUrl,
  });

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
