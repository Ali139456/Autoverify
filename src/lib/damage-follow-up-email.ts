import {
  getInspectionPhotoNotifyEmails,
  sendInspectionDamageFollowUpEmail,
} from "@/lib/email";
import { getReport, updateReport } from "@/lib/store";
import { listReportIdsForDamageFollowUp } from "@/lib/store-supabase";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";

function isLavDigitalReport(report: NonNullable<Awaited<ReturnType<typeof getReport>>>): boolean {
  return (
    report.lavContext?.productKind === "lender_asset_verification" &&
    report.lavContext.inspectionType === "digital"
  );
}

/** Customer email when the report is ready (Insights+ damage or LAV digital capture complete). */
export async function notifyDamageAssessmentCompleteEmail(
  reportId: string,
): Promise<boolean> {
  let report = await getReport(reportId);
  if (!report || report.damageFollowUpEmailSentAt) {
    return false;
  }
  const lavDigital = isLavDigitalReport(report);
  if (!lavDigital && !report.damage) {
    return false;
  }

  const emails = getInspectionPhotoNotifyEmails(report);
  if (emails.length === 0) {
    return false;
  }

  report = (await getReport(reportId)) ?? report;

  let ok = true;
  for (const email of emails) {
    try {
      await sendInspectionDamageFollowUpEmail(report, email);
    } catch (err) {
      ok = false;
      console.error(
        `[damage-complete-email] failed for ${reportId} (${email}):`,
        err,
      );
    }
  }

  if (ok) {
    await updateReport(reportId, {
      damageFollowUpEmailSentAt: new Date().toISOString(),
    });
    return true;
  }

  return false;
}

export async function runDamageFollowUpEmailJob(): Promise<{
  scanned: number;
  sent: number;
  skipped: number;
}> {
  if (!isSupabaseServerConfigured()) {
    return { scanned: 0, sent: 0, skipped: 0 };
  }

  const reportIds = await listReportIdsForDamageFollowUp();
  let sent = 0;
  let skipped = 0;

  for (const reportId of reportIds) {
    let report = await getReport(reportId);
    if (!report?.damage || report.damageFollowUpEmailSentAt) {
      skipped += 1;
      continue;
    }

    const emails = getInspectionPhotoNotifyEmails(report);
    if (emails.length === 0) {
      skipped += 1;
      continue;
    }

    report = (await getReport(reportId)) ?? report;

    let ok = true;
    for (const email of emails) {
      try {
        await sendInspectionDamageFollowUpEmail(report, email);
      } catch (err) {
        ok = false;
        console.error(
          `[damage-follow-up] email failed for ${reportId} (${email}):`,
          err,
        );
      }
    }

    if (ok) {
      await updateReport(reportId, {
        damageFollowUpEmailSentAt: new Date().toISOString(),
      });
      sent += 1;
    } else {
      skipped += 1;
    }
  }

  return { scanned: reportIds.length, sent, skipped };
}
