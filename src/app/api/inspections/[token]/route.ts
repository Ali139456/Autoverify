import { NextRequest, NextResponse } from "next/server";
import {
  getInspectionByToken,
  getInspectionProgress,
  isInspectionExpired,
} from "@/lib/inspections";
import { INSPECTION_ANGLES } from "@/lib/inspection-angles";
import { guardRateLimit, isBoundedAccessToken } from "@/lib/security";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token: rawToken } = await params;
  const token = rawToken.trim();

  const rateLimited = guardRateLimit(req, `inspection-get:${token.slice(0, 32)}`, 200, 60 * 60 * 1000);
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

  return NextResponse.json(
    {
      inspectionId: inspection.id,
      reportId: inspection.reportId,
      status: inspection.status,
      photos: inspection.photos,
      progress,
      angles: INSPECTION_ANGLES,
      expiresAt: inspection.expiresAt,
    },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  );
}
