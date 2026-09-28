import { NextRequest, NextResponse } from "next/server";
import { fetchPpsrCertificateBuffer } from "@/lib/ppsr-certificate";
import { getReport } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }
  if (report.status !== "paid") {
    return NextResponse.json(
      { error: "Report has not been purchased." },
      { status: 403 },
    );
  }

  const certificateUrl = report.registration.ppsrCertificateUrl?.trim();
  if (!certificateUrl) {
    return NextResponse.json(
      { error: "No PPSR certificate is available for this report." },
      { status: 404 },
    );
  }

  const buffer = await fetchPpsrCertificateBuffer(certificateUrl);
  if (!buffer) {
    return NextResponse.json(
      { error: "Unable to retrieve the PPSR certificate." },
      { status: 502 },
    );
  }

  const identifier = report.vehicle.rego || report.vehicle.vin || report.id;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="PPSR-Certificate-${identifier}.pdf"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
