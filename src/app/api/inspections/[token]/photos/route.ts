import { NextRequest, NextResponse } from "next/server";
import {
  getInspectionByToken,
  isInspectionExpired,
  uploadInspectionPhoto,
} from "@/lib/inspections";
import { isValidInspectionAngleId } from "@/lib/inspection-angles";
import {
  parseOptionalFloat,
  parseOptionalIsoTimestamp,
} from "@/lib/inspection-photo-evidence";

export async function POST(
  req: NextRequest,
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

  if (["processing", "complete"].includes(inspection.status)) {
    return NextResponse.json(
      { error: "This inspection has already been submitted." },
      { status: 409 },
    );
  }

  const form = await req.formData();
  const angle = String(form.get("angle") ?? "").trim();
  const file = form.get("photo");

  if (!isValidInspectionAngleId(angle)) {
    return NextResponse.json({ error: "Invalid photo angle." }, { status: 400 });
  }

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      {
        error:
          "Photo file is missing or incomplete. Try again or use a smaller photo.",
      },
      { status: 400 },
    );
  }

  const isImage =
    file.type.startsWith("image/") ||
    /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(file.name);
  if (!isImage) {
    return NextResponse.json({ error: "Only image uploads are supported." }, { status: 400 });
  }

  if (file.size > 12 * 1024 * 1024) {
    return NextResponse.json({ error: "Photo must be under 12 MB." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const photo = await uploadInspectionPhoto({
      inspection,
      angle,
      buffer,
      contentType: file.type,
      capturedAt: parseOptionalIsoTimestamp(form.get("capturedAt")),
      latitude: parseOptionalFloat(form.get("latitude")),
      longitude: parseOptionalFloat(form.get("longitude")),
      locationAccuracyM: parseOptionalFloat(form.get("locationAccuracyM")),
    });

    return NextResponse.json({ ok: true, photo });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not upload photo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
