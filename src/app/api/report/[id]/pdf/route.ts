import { NextRequest, NextResponse } from "next/server";
import { generateReportPdfBuffer } from "@/lib/report-pdf-buffer";
import { getReport } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }
  if (report.status !== "paid") {
    return NextResponse.json(
      { error: "Report has not been purchased." },
      { status: 403 }
    );
  }

  const buffer = await generateReportPdfBuffer(report);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="AutoVerifi-Report-${report.vehicle.rego}.pdf"`,
    },
  });
}
