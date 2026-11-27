import { NextRequest, NextResponse } from "next/server";
import {
  getInspectionByReportId,
  isPersistedInspectionStoragePath,
} from "@/lib/inspections";
import { INSPECTION_PHOTO_BUCKET } from "@/lib/inspection-angles";
import { createServerClient } from "@/lib/supabase/server";
import {
  isAutoVerifiReportId,
  parseReportIdFromRouteParam,
} from "@/lib/ravin-report-trace";
import { getReport } from "@/lib/store";
import { guardRateLimit } from "@/lib/security";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await params;
  const reportId = parseReportIdFromRouteParam(rawId);
  if (!isAutoVerifiReportId(reportId)) {
    return new NextResponse(null, { status: 404 });
  }

  const rateLimited = guardRateLimit(
    req,
    `report-inspection-photo:${reportId.slice(0, 24)}`,
    240,
    60 * 60 * 1000,
  );
  if (rateLimited) return rateLimited;

  const angle = req.nextUrl.searchParams.get("angle")?.trim();
  if (!angle) {
    return NextResponse.json({ error: "Missing angle." }, { status: 400 });
  }

  const report = await getReport(reportId);
  if (!report || report.status !== "paid") {
    return new NextResponse(null, { status: 404 });
  }

  const inspection = await getInspectionByReportId(reportId);
  const photo = inspection?.photos.find((entry) => entry.angle === angle);
  if (!photo) {
    return new NextResponse(null, { status: 404 });
  }

  const storagePath = photo.storagePath?.trim();
  if (!storagePath) {
    return new NextResponse(null, { status: 404 });
  }

  if (!isPersistedInspectionStoragePath(storagePath)) {
    const publicUrl =
      photo.externalUrl?.trim() ||
      (storagePath.startsWith("http") ? storagePath : null);
    if (publicUrl?.startsWith("http")) {
      return NextResponse.redirect(publicUrl, 302);
    }
    return new NextResponse(null, { status: 404 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase.storage
    .from(INSPECTION_PHOTO_BUCKET)
    .download(storagePath);

  if (error || !data) {
    console.error(
      `[inspection-photo] missing object report=${reportId} angle=${angle}:`,
      error?.message,
    );
    return new NextResponse(null, { status: 404 });
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": data.type || "image/jpeg",
      "Cache-Control": "private, max-age=3600, stale-while-revalidate=86400",
    },
  });
}