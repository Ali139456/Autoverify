import { createElement, ReactElement } from "react";
import { NextRequest, NextResponse } from "next/server";
import { DocumentProps, renderToBuffer } from "@react-pdf/renderer";
import { ReportPdf } from "@/lib/pdf";
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

  const buffer = await renderToBuffer(
    createElement(ReportPdf, { report }) as ReactElement<DocumentProps>
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="AutoVerifi-Report-${report.vehicle.rego}.pdf"`,
    },
  });
}
