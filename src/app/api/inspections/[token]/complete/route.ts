import { NextRequest, NextResponse } from "next/server";
import {
  downloadInspectionPhotos,
  getInspectionById,
  getInspectionByToken,
  getInspectionProgress,
  isInspectionExpired,
  updateInspection,
} from "@/lib/inspections";
import {
  getInspectionPhotoNotifyEmails,
  sendInspectionPhotosUpdatedEmail,
} from "@/lib/email";
import { getReport, updateReport } from "@/lib/store";
import { syncRavinReportIfPending } from "@/lib/ravin-background-sync";
import { submitInspectionToRavin } from "@/lib/ravin-ingest";
import {
  withRavinIngestError,
  withRavinIngestTrace,
} from "@/lib/ravin-payload-store";
import { guardRateLimit, isBoundedAccessToken } from "@/lib/security";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token: rawToken } = await params;
  const token = rawToken.trim();

  const rateLimited = guardRateLimit(
    req,
    `inspection-complete:${token.slice(0, 32)}`,
    20,
    60 * 60 * 1000,
  );
  if (rateLimited) return rateLimited;

  if (!isBoundedAccessToken(token)) {
    return NextResponse.json({ error: "Inspection not found." }, { status: 404 });
  }

  const inspection = await getInspectionByToken(token);

  if (!inspection) {
    return NextResponse.json({ error: "Inspection not found." }, { status: 404 });
  }

  if (isInspectionExpired(inspection)) {
    return NextResponse.json({ error: "Inspection link expired." }, { status: 410 });
  }

  const progress = getInspectionProgress(inspection.photos);
  if (progress.completed === 0) {
    return NextResponse.json({ error: "Upload at least one photo first." }, { status: 400 });
  }

  try {
    const report = await getReport(inspection.reportId);
    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    const freshInspection =
      (await getInspectionById(inspection.id)) ?? inspection;
    const photoFiles = await downloadInspectionPhotos(freshInspection);

    await updateInspection(inspection.id, {
      status: "uploaded",
      completedAt: new Date().toISOString(),
    });

    await updateReport(inspection.reportId, {
      workflowStatus: "processing_ravin",
    });

    let submission;
    try {
      submission = await submitInspectionToRavin({
        reportId: inspection.reportId,
        inspectionId: inspection.id,
        ravinInspectionId: freshInspection.ravinInspectionId,
        vin: report.vehicle.vin,
        photos: photoFiles,
      });
    } catch (ravinErr) {
      console.error("[inspections/complete] Ravin ingest failed:", ravinErr);
      const ingestErrorMessage =
        ravinErr instanceof Error ? ravinErr.message : "Ravin ingest failed.";
      await updateInspection(inspection.id, {
        status: "uploaded",
        ravinPayload: withRavinIngestError(
          freshInspection.ravinPayload,
          ingestErrorMessage,
        ),
      });
      return NextResponse.json({
        ok: true,
        mode: "pending",
        complete: false,
        missingAngles: progress.missing,
        ravinIngestError: ingestErrorMessage,
        message:
          "Photos saved to your Auto Verifi report. AI damage analysis will be added automatically once condition assessment is complete.",
      });
    }

    const damageAnalysisReady =
      submission.mode === "demo" && Boolean(submission.damage);

    const notifyEmails = getInspectionPhotoNotifyEmails(report);
    for (const notifyEmail of notifyEmails) {
      void sendInspectionPhotosUpdatedEmail(report, notifyEmail, {
        damageAnalysisReady,
      }).catch((err) => {
        console.error(
          `[inspections/complete] inspection update email failed (${notifyEmail}):`,
          err,
        );
      });
    }
    if (notifyEmails.length === 0) {
      console.warn(
        `[inspections/complete] no notify email for report ${report.id} (set customer email or AUTOVERIFI_SUPPORT_EMAIL).`,
      );
    }

    if (submission.mode === "demo" && submission.damage) {
      await updateInspection(inspection.id, {
        status: "complete",
        ravinInspectionId: submission.ravinInspectionId,
        completedAt: new Date().toISOString(),
        ravinPayload: withRavinIngestTrace(
          freshInspection.ravinPayload,
          submission.ingestTrace,
        ),
      });

      await updateReport(inspection.reportId, {
        damage: submission.damage,
        workflowStatus: "complete",
      });

      return NextResponse.json({
        ok: true,
        mode: "demo",
        complete: true,
        missingAngles: progress.missing,
        findings: submission.damage.findings.length,
        ravinIngest: submission.ingestTrace,
      });
    }

    if (submission.mode === "pending") {
      // Photos are saved and visible on the report; keep the session open so the
      // owner can add/retake angles until Ravin's webhook completes it.
      await updateInspection(inspection.id, {
        status: "uploaded",
        ravinInspectionId: submission.ravinInspectionId,
        ravinPayload: withRavinIngestTrace(
          freshInspection.ravinPayload,
          submission.ingestTrace,
        ),
      });

      void syncRavinReportIfPending(inspection.reportId).catch((err) => {
        console.error("[inspections/complete] Ravin sync after S3:", err);
      });

      return NextResponse.json({
        ok: true,
        mode: "pending",
        complete: false,
        missingAngles: progress.missing,
        ravinIngest: submission.ingestTrace,
        message:
          "Photos saved to your Auto Verifi report. AI damage analysis will be added automatically once condition assessment is complete.",
      });
    }

    await updateInspection(inspection.id, {
      status: "processing",
      ravinInspectionId: submission.ravinInspectionId,
      ravinPayload: withRavinIngestTrace(
        freshInspection.ravinPayload,
        submission.ingestTrace,
      ),
    });

    void syncRavinReportIfPending(inspection.reportId).catch((err) => {
      console.error("[inspections/complete] Ravin sync after S3:", err);
    });

    return NextResponse.json({
      ok: true,
      mode: submission.mode,
      complete: false,
      missingAngles: progress.missing,
      ravinIngest: submission.ingestTrace,
      message:
        "Photos saved to your Auto Verifi report. AI damage analysis will be added automatically once condition assessment is complete.",
    });
  } catch (err) {
    await updateInspection(inspection.id, { status: "failed" });
    const message =
      err instanceof Error ? err.message : "Could not complete inspection.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
