import { formatReportReference } from "@/lib/report-design";
import type { VehicleReport } from "@/lib/types";
import { hasVehicleSpecContent } from "@/lib/vehicle-spec-sheet";
import { ReportShell } from "./ReportShell";
import { VehicleSpecReportSection } from "./VehicleSpecReportSection";

export function VehicleSpecReportPage({
  report,
  pageLabel,
  factoryPageLabel,
}: {
  report: VehicleReport;
  pageLabel: string;
  factoryPageLabel?: string;
}) {
  const sheet = report.vehicleSpec;
  if (!hasVehicleSpecContent(sheet)) return null;

  const hasFactory = sheet!.factoryFeatures.length > 0;
  const shellProps = {
    reportId: report.id,
    generatedAt: report.createdAt,
    reportReference: formatReportReference(report.vehicle),
    className: "report-shell-spec",
  };

  if (!hasFactory || !factoryPageLabel) {
    return (
      <ReportShell {...shellProps} pageLabel={pageLabel}>
        <VehicleSpecReportSection report={report} part="full" />
      </ReportShell>
    );
  }

  return (
    <>
      <ReportShell {...shellProps} pageLabel={pageLabel}>
        <VehicleSpecReportSection report={report} part="data" />
      </ReportShell>
      <div className="report-page-break report-spec-continued">
        <ReportShell {...shellProps} pageLabel={factoryPageLabel}>
          <VehicleSpecReportSection report={report} part="factory" />
        </ReportShell>
      </div>
    </>
  );
}
