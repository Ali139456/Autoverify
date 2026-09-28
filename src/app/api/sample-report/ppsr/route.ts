import { NextResponse } from "next/server";
import { buildSampleReport } from "@/lib/build-sample-report";
import { generateSamplePpsrPdfBuffer } from "@/lib/sample-ppsr-pdf";

export async function GET() {
  const report = buildSampleReport("insights");
  const buffer = await generateSamplePpsrPdfBuffer(report);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'inline; filename="Sample-PPSR-Certificate-MB3NZ.pdf"',
      "Cache-Control": "public, max-age=86400",
    },
  });
}
