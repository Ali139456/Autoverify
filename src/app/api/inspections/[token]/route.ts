import { NextRequest, NextResponse } from "next/server";
import {
  getInspectionByToken,
  getInspectionProgress,
  isInspectionExpired,
} from "@/lib/inspections";
import { INSPECTION_ANGLES } from "@/lib/inspection-angles";

export async function GET(
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

  return NextResponse.json({
    inspectionId: inspection.id,
    reportId: inspection.reportId,
    status: inspection.status,
    photos: inspection.photos,
    progress,
    angles: INSPECTION_ANGLES,
    expiresAt: inspection.expiresAt,
  });
}
