import {
  AI_DAMAGE_FOLLOW_UP_EMAIL_PROMISE,
  AI_DAMAGE_PROCESSING_SHORT,
} from "@/lib/damage-processing-copy";

/** LAV Digital Self Inspection — primary email heading (subject + title). */
export const LAV_DIGITAL_SELF_INSPECTION_EMAIL_HEADING =
  "Lender Asset Verification - Digital Self Inspection";
import {
  BRANDED_EMAIL_BLUE,
  BRANDED_EMAIL_NAVY,
  buildBrandedEmailLayout,
  escapeBrandedEmailHtml,
} from "@/lib/branded-email-layout";

function vehicleLine(vehicleLabel: string, regoSuffix: string): string {
  return `<strong style="color:${BRANDED_EMAIL_NAVY};">${escapeBrandedEmailHtml(vehicleLabel)}</strong>${escapeBrandedEmailHtml(regoSuffix)}`;
}

function processingBodyHtml(): string {
  return `<p style="margin:0 0 12px;padding:14px 16px;border-radius:10px;background:#eff6ff;border:1px solid #bfdbfe;"><strong style="color:${BRANDED_EMAIL_BLUE};">AI condition assessment is still processing.</strong> ${escapeBrandedEmailHtml(AI_DAMAGE_PROCESSING_SHORT)}</p>
<p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">${escapeBrandedEmailHtml(AI_DAMAGE_FOLLOW_UP_EMAIL_PROMISE)}</p>`;
}

export function buildInspectionPhotosUpdatedEmailHtml(input: {
  isLav: boolean;
  lavDigitalSelfInspection?: boolean;
  damageAnalysisReady: boolean;
  vehicleLabel: string;
  regoSuffix: string;
  reportUrl: string;
  pdfUrl: string;
  baseUrl: string;
}): string {
  const {
    isLav,
    lavDigitalSelfInspection = false,
    damageAnalysisReady,
    vehicleLabel,
    regoSuffix,
    reportUrl,
    pdfUrl,
    baseUrl,
  } = input;
  const vehicle = vehicleLine(vehicleLabel, regoSuffix);
  const lavHeading = lavDigitalSelfInspection
    ? LAV_DIGITAL_SELF_INSPECTION_EMAIL_HEADING
    : "Lender asset verification";

  if (isLav && damageAnalysisReady) {
    return buildBrandedEmailLayout({
      baseUrl,
      eyebrow: lavHeading,
      title: lavDigitalSelfInspection ? lavHeading : "Report updated",
      introHtml: `Your lender asset verification report for ${vehicle} has been updated with inspection photos and AI damage analysis.`,
      ctas: [
        { label: "View report online", href: reportUrl, primary: true },
        { label: "Download PDF", href: pdfUrl, primary: false },
      ],
    });
  }

  if (isLav && !damageAnalysisReady) {
    return buildBrandedEmailLayout({
      baseUrl,
      eyebrow: lavHeading,
      title: lavDigitalSelfInspection ? lavHeading : "Photos received",
      introHtml: `Your Digital Self Inspection photos for ${vehicle} are saved.`,
      bodyHtml: processingBodyHtml(),
    });
  }

  if (!isLav && damageAnalysisReady) {
    return buildBrandedEmailLayout({
      baseUrl,
      eyebrow: "Auto Verifi Insights+",
      title: "Inspection photos added",
      introHtml: `Inspection photos for ${vehicle} have been added to your Auto Verifi Insights+ report.`,
      ctas: [
        { label: "View report online", href: reportUrl, primary: true },
        { label: "Download PDF", href: pdfUrl, primary: false },
      ],
    });
  }

  return buildBrandedEmailLayout({
    baseUrl,
    eyebrow: "Auto Verifi Insights+",
    title: "Photos received",
    introHtml: `Your guided inspection photos for ${vehicle} are saved on your Auto Verifi Insights+ report.`,
    bodyHtml: processingBodyHtml(),
    ctas: [
      { label: "View report online", href: reportUrl, primary: true },
      { label: "Download PDF", href: pdfUrl, primary: false },
    ],
  });
}

export function buildInspectionDamageFollowUpEmailHtml(input: {
  isLav: boolean;
  lavDigitalSelfInspection?: boolean;
  damageReady: boolean;
  vehicleLabel: string;
  regoSuffix: string;
  reportUrl: string;
  pdfUrl: string;
  baseUrl: string;
  pdfAttached?: boolean;
}): string {
  const {
    isLav,
    lavDigitalSelfInspection = false,
    damageReady,
    vehicleLabel,
    regoSuffix,
    reportUrl,
    pdfUrl,
    baseUrl,
    pdfAttached = false,
  } = input;
  const vehicle = vehicleLine(vehicleLabel, regoSuffix);
  const lavHeading = lavDigitalSelfInspection
    ? LAV_DIGITAL_SELF_INSPECTION_EMAIL_HEADING
    : "Lender asset verification";
  const productLine = isLav
    ? "lender asset verification report"
    : "Auto Verifi Insights+ report";

  const statusHtml = damageReady
    ? `<p style="margin:0;padding:14px 16px;border-radius:10px;background:#ecfdf5;border:1px solid #a7f3d0;"><strong style="color:#047857;">AI condition assessment is complete.</strong> Your latest walkaround and condition results are on your report.</p>`
    : `<p style="margin:0;padding:14px 16px;border-radius:10px;background:#eff6ff;border:1px solid #bfdbfe;"><strong style="color:${BRANDED_EMAIL_BLUE};">AI damage analysis may still be finishing</strong> — refresh your report online for the latest results.</p>`;

  const footerNoteHtml = pdfAttached
    ? "A copy of your report PDF is attached to this email. You can also view or download it using the links below."
    : undefined;

  const completionTitle = isLav
    ? lavDigitalSelfInspection
      ? lavHeading
      : "Your report is ready"
    : "AI condition assessment processed";

  return buildBrandedEmailLayout({
    baseUrl,
    eyebrow: isLav ? lavHeading : "Auto Verifi Insights+",
    title: damageReady ? completionTitle : "Report updated",
    introHtml: isLav
      ? `Your ${escapeBrandedEmailHtml(productLine)} for ${vehicle} has been updated with your latest inspection photos and AI condition assessment results.`
      : `Your guided inspection photos for ${vehicle} are on your ${escapeBrandedEmailHtml(productLine)}. AI condition assessment is complete.`,
    bodyHtml: statusHtml,
    ctas: [
      { label: "View your report online", href: reportUrl, primary: true },
      { label: "Download PDF", href: pdfUrl, primary: false },
    ],
    footerNoteHtml,
  });
}
