import { NextRequest, NextResponse } from "next/server";
import {
  getInspectionByToken,
  isInspectionExpired,
  uploadInspectionPhoto,
} from "@/lib/inspections";
import { INSPECTION_ANGLE_IDS } from "@/lib/inspection-angles";

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

  if (!INSPECTION_ANGLE_IDS.includes(angle as (typeof INSPECTION_ANGLE_IDS)[number])) {
    return NextResponse.json({ error: "Invalid photo angle." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Photo file is required." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
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
    });

    return NextResponse.json({ ok: true, photo });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not upload photo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
