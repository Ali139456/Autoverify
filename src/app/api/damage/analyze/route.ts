import { NextRequest, NextResponse } from "next/server";
import {
  MANUAL_DAMAGE_UPLOAD_MAX_PHOTOS,
  isValidInspectionAngleId,
} from "@/lib/inspection-angles";
import {
  ensureInspectionForManualUpload,
  finalizeManualDamageUpload,
  saveManualDamagePhoto,
} from "@/lib/manual-damage-upload";
import { analyzeDamage } from "@/lib/ravin";
import { hasDamageAnalysis } from "@/lib/pricing";
import { getReport, updateReport } from "@/lib/store";
import { isAutoVerifiReportId } from "@/lib/ravin-report-trace";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";
import { guardBrowserPost, rejectOversizedBody } from "@/lib/security";

const MAX_PHOTOS = MANUAL_DAMAGE_UPLOAD_MAX_PHOTOS;
/** Vercel serverless body limit is ~4.5 MB — stay under per photo. */
const MAX_SINGLE_BODY = 4 * 1024 * 1024;
const MAX_SIZE = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const blocked = guardBrowserPost(req, "damage-analyze", 120, 60 * 60 * 1000);
  if (blocked) return blocked;

  const tooLarge = rejectOversizedBody(req, MAX_SINGLE_BODY);
  if (tooLarge) return tooLarge;

  try {
    const form = await req.formData();
    const reportId = String(form.get("reportId") ?? "")
      .trim()
      .toUpperCase();

    if (!reportId || !isAutoVerifiReportId(reportId)) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    const report = await getReport(reportId);
    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }
    if (report.status !== "paid") {
      return NextResponse.json(
        { error: "Report must be purchased before photo analysis." },
        { status: 403 },
      );
    }
    if (!hasDamageAnalysis(report.tier)) {
      return NextResponse.json(
        { error: "AI photo inspection is included with Auto Verifi Insights+ only." },
        { status: 403 },
      );
    }

    const angle = String(form.get("angle") ?? "").trim();
    const singlePhoto = form.get("photo");
    const finalize = String(form.get("finalize") ?? "") === "1";

    if (angle && singlePhoto instanceof File) {
      if (!isValidInspectionAngleId(angle)) {
        return NextResponse.json({ error: "Invalid photo slot." }, { status: 400 });
      }
      if (!singlePhoto.type.startsWith("image/") && !/\.(jpe?g|png|webp|heic)/i.test(singlePhoto.name)) {
        return NextResponse.json(
          { error: `${singlePhoto.name} is not an image.` },
          { status: 400 },
        );
      }
      if (singlePhoto.size > MAX_SIZE) {
        return NextResponse.json(
          {
            error:
              "This photo is still too large after compression. Try a smaller image or use the mobile walkaround link.",
          },
          { status: 400 },
        );
      }

      const inspection = await ensureInspectionForManualUpload(report);
      const buffer = Buffer.from(await singlePhoto.arrayBuffer());
      await saveManualDamagePhoto({
        inspection,
        angle,
        buffer,
        contentType:
          singlePhoto.type?.startsWith("image/") ? singlePhoto.type : "image/jpeg",
      });

      if (!finalize) {
        return NextResponse.json({
          ok: true,
          step: "uploaded",
          angle,
        });
      }

      const result = await finalizeManualDamageUpload(reportId);
      return NextResponse.json(result);
    }

    if (isSupabaseServerConfigured()) {
      return NextResponse.json(
        {
          error:
            "Use the updated upload flow (one photo per request). Refresh the page and try again.",
        },
        { status: 400 },
      );
    }

    const files = form
      .getAll("photos")
      .filter((f): f is File => f instanceof File)
      .slice(0, MAX_PHOTOS);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Please attach at least one photo." },
        { status: 400 },
      );
    }

    const photos = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: `${file.name} is not an image.` },
          { status: 400 },
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `${file.name} is too large — use smaller photos.` },
          { status: 400 },
        );
      }
      photos.push({
        name: file.name,
        data: Buffer.from(await file.arrayBuffer()),
        contentType: file.type,
      });
    }

    const damage = await analyzeDamage(photos);
    await updateReport(reportId, { damage });

    return NextResponse.json({ ok: true, mode: "demo", damage });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Damage analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}