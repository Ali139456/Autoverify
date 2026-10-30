import {
  AI_DAMAGE_FOLLOW_UP_EMAIL_PROMISE,
  AI_DAMAGE_PROCESSING_SHORT,
} from "@/lib/damage-processing-copy";
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
  return `<p style="margin:0 0 12px;padding:14px 16px;border-radius:10px;background:#eff6ff;border:1px solid #bfdbfe;"><strong style="color:${BRANDED_EMAIL_BLUE};">AI damage analysis is still processing.</strong> ${escapeBrandedEmailHtml(AI_DAMAGE_PROCESSING_SHORT)}</p>
<p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">${escapeBrandedEmailHtml(AI_DAMAGE_FOLLOW_UP_EMAIL_PROMISE)}</p>`;
}

export function buildInspectionPhotosUpdatedEmailHtml(input: {
  isLav: boolean;
  damageAnalysisReady: boolean;
  vehicleLabel: string;
  regoSuffix: string;
  reportUrl: string;
  pdfUrl: string;
  baseUrl: string;
}): string {
  const {
    isLav,
    damageAnalysisReady,
    vehicleLabel,
    regoSuffix,
    reportUrl,
    pdfUrl,
    baseUrl,
  } = input;
  const vehicle = vehicleLine(vehicleLabel, regoSuffix);

  if (isLav && damageAnalysisReady) {
    return buildBrandedEmailLayout({
      baseUrl,
      eyebrow: "Lender asset verification",
      title: "Report updated",
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
      eyebrow: "Digital self inspection",
      title: "Photos received",
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
    damageReady,
    vehicleLabel,
    regoSuffix,
    reportUrl,
    pdfUrl,
    baseUrl,
    pdfAttached = false,
  } = input;
  const vehicle = vehicleLine(vehicleLabel, regoSuffix);
  const productLine = isLav
    ? "lender asset verification report"
    : "Auto Verifi Insights+ report";

  const statusHtml = damageReady
    ? `<p style="margin:0;padding:14px 16px;border-radius:10px;background:#ecfdf5;border:1px solid #a7f3d0;"><strong style="color:#047857;">Photo scanning and AI damage analysis are now complete.</strong> Your latest walkaround and condition results are on your report.</p>`
    : `<p style="margin:0;padding:14px 16px;border-radius:10px;background:#eff6ff;border:1px solid #bfdbfe;"><strong style="color:${BRANDED_EMAIL_BLUE};">AI damage analysis may still be finishing</strong> — refresh your report online for the latest results.</p>`;

  const footerNoteHtml = pdfAttached
    ? "A copy of your report PDF is attached to this email. You can also view or download it using the links below."
    : undefined;

  return buildBrandedEmailLayout({
    baseUrl,
    eyebrow: isLav ? "Lender asset verification" : "Auto Verifi Insights+",
    title: damageReady ? "Your report is ready" : "Report updated",
    introHtml: isLav
      ? `Your ${escapeBrandedEmailHtml(productLine)} for ${vehicle} has been updated with your latest inspection photos and AI damage analysis results.`
      : `Your guided inspection photos for ${vehicle} are saved on your ${escapeBrandedEmailHtml(productLine)}.`,
    bodyHtml: statusHtml,
    ctas: [
      { label: "View your report online", href: reportUrl, primary: true },
      { label: "Download PDF", href: pdfUrl, primary: false },
    ],
    footerNoteHtml,
  });
}
