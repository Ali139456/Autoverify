import type { ReactNode } from "react";
import { formatReportReference } from "@/lib/report-design";
import type { VehicleReport } from "@/lib/types";
import { hasVehicleSpecContent } from "@/lib/vehicle-spec-sheet";
import { ReportShell } from "./ReportShell";
import { VehicleSpecReportSection } from "./VehicleSpecReportSection";

export function VehicleSpecReportPage({
  report,
  pageLabel,
  factoryPageLabel,
  trailingContent,
}: {
  report: VehicleReport;
  pageLabel: string;
  factoryPageLabel?: string;
  /** Rendered at the end of the last spec page (e.g. the general disclaimer). */
  trailingContent?: ReactNode;
}) {
  const sheet = report.vehicleSpec;
  if (!hasVehicleSpecContent(sheet)) return null;

  const hasFactory = sheet!.factoryFeatures.length > 0;
  const shellProps = {
    reportId: report.id,
    generatedAt: report.createdAt,
    reportReference: formatReportReference(report.vehicle),
    className: "report-shell-spec report-shell-flow",
  };

  if (!hasFactory || !factoryPageLabel) {
    return (
      <ReportShell {...shellProps} pageLabel={pageLabel}>
        <div className="space-y-6">
          <VehicleSpecReportSection report={report} part="full" />
          {trailingContent}
        </div>
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
          <div className="space-y-6">
            <VehicleSpecReportSection report={report} part="factory" />
            {trailingContent}
          </div>
        </ReportShell>
      </div>
    </>
  );
}
