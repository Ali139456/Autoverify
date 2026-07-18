import { NextRequest, NextResponse } from "next/server";
import { analyzeDamage } from "@/lib/ravin";
import { getReport, updateReport } from "@/lib/store";

const MAX_PHOTOS = 8;
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB per photo

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const reportId = String(form.get("reportId") ?? "");

    const report = await getReport(reportId);
    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }
    if (report.status !== "paid") {
      return NextResponse.json(
        { error: "Report must be purchased before photo analysis." },
        { status: 403 }
      );
    }

    const files = form
      .getAll("photos")
      .filter((f): f is File => f instanceof File)
      .slice(0, MAX_PHOTOS);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "Please attach at least one photo." },
        { status: 400 }
      );
    }

    const photos = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: `${file.name} is not an image.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `${file.name} exceeds the 10 MB limit.` },
          { status: 400 }
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

    return NextResponse.json({ damage });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Damage analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
