import { NextRequest, NextResponse } from "next/server";
import {
  downloadInspectionPhotos,
  getInspectionByToken,
  getInspectionProgress,
  isInspectionExpired,
  updateInspection,
} from "@/lib/inspections";
import { getReport, updateReport } from "@/lib/store";
import { submitInspectionToRavin, isRavinS3Configured } from "@/lib/ravin-ingest";
import { analyzeDamage } from "@/lib/ravin";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
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

    const photoFiles = await downloadInspectionPhotos(inspection);

    await updateInspection(inspection.id, {
      status: "uploaded",
      completedAt: new Date().toISOString(),
    });

    await updateReport(inspection.reportId, {
      workflowStatus: "processing_ravin",
    });

    const submission = await submitInspectionToRavin({
      reportId: inspection.reportId,
      inspectionId: inspection.id,
      vin: report.vehicle.vin,
      photos: photoFiles,
    });

    await updateInspection(inspection.id, {
      status: "processing",
      ravinInspectionId: submission.ravinInspectionId,
    });

    if (submission.mode === "demo" && !isRavinS3Configured()) {
      const damage = await analyzeDamage(
        photoFiles.map((photo) => ({
          name: photo.name,
          data: photo.data,
          contentType: photo.contentType,
        })),
      );

      await updateInspection(inspection.id, {
        status: "complete",
        completedAt: new Date().toISOString(),
      });

      await updateReport(inspection.reportId, {
        damage,
        workflowStatus: "complete",
      });

      return NextResponse.json({
        ok: true,
        mode: "demo",
        complete: true,
        missingAngles: progress.missing,
        findings: damage.findings.length,
      });
    }

    return NextResponse.json({
      ok: true,
      mode: submission.mode,
      complete: false,
      missingAngles: progress.missing,
      message:
        "Photos submitted to Ravin. Your report will update automatically when analysis completes.",
    });
  } catch (err) {
    await updateInspection(inspection.id, { status: "failed" });
    const message =
      err instanceof Error ? err.message : "Could not complete inspection.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
