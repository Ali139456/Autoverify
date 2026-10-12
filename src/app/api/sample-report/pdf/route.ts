import { NextRequest, NextResponse } from "next/server";
import { buildSampleReport } from "@/lib/build-sample-report";
import { parseReportTier } from "@/lib/pricing";
import { generateReportPdfBuffer } from "@/lib/report-pdf-buffer";

export async function GET(req: NextRequest) {
  const tier = parseReportTier(req.nextUrl.searchParams.get("tier") ?? undefined);
  const report = buildSampleReport(tier);
  const buffer = await generateReportPdfBuffer(report);
  const suffix = tier === "insights_plus" ? "Insights-Plus" : "Insights";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="AutoVerifi-Sample-Report-${suffix}-MB3NZ.pdf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
