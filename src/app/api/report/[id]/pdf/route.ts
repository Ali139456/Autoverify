import { NextRequest, NextResponse } from "next/server";
import {
  refreshPpsrCertificateSummary,
  refreshRegistrationIfMissing,
} from "@/lib/autograb";
import { applyRegistrationExpiryInference } from "@/lib/registration-info";
import { generateReportPdfBuffer } from "@/lib/report-pdf-buffer";
import { getReport } from "@/lib/store";
import {
  isAutoVerifiReportId,
  parseReportIdFromRouteParam,
} from "@/lib/ravin-report-trace";
import { guardRateLimit } from "@/lib/security";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimited = guardRateLimit(req, "report-pdf", 60, 60 * 60 * 1000);
  if (rateLimited) return rateLimited;

  const { id: rawId } = await params;
  const id = parseReportIdFromRouteParam(rawId);
  if (!isAutoVerifiReportId(id)) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

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

  let registration = applyRegistrationExpiryInference(
    await refreshRegistrationIfMissing(report.registration, report.vehicle),
  );
  const ppsrRefresh = await refreshPpsrCertificateSummary(report.vehicle);
  if (ppsrRefresh?.regoExpiry?.trim()) {
    registration = applyRegistrationExpiryInference({
      ...registration,
      expiryDate: registration.expiryDate?.trim() || ppsrRefresh.regoExpiry,
    });
  }
  const enriched =
    registration === report.registration
      ? report
      : { ...report, registration };

  const buffer = await generateReportPdfBuffer(enriched);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="AutoVerifi-Report-${report.vehicle.rego}.pdf"`,
    },
  });
}
