import { formatReportReference } from "@/lib/report-design";
import type { VehicleReport } from "@/lib/types";
import { hasVehicleSpecContent } from "@/lib/vehicle-spec-sheet";
import { ReportShell } from "./ReportShell";
import { VehicleSpecReportSection } from "./VehicleSpecReportSection";

export function VehicleSpecReportPage({
  report,
  pageLabel,
}: {
  report: VehicleReport;
  pageLabel: string;
}) {
  if (!hasVehicleSpecContent(report.vehicleSpec)) return null;

  return (
    <ReportShell
      reportId={report.id}
      generatedAt={report.createdAt}
      reportReference={formatReportReference(report.vehicle)}
      pageLabel={pageLabel}
      className="report-shell-spec"
    >
      <VehicleSpecReportSection report={report} />
    </ReportShell>
  );
}
