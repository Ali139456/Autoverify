import type { ReactNode } from "react";

import { formatReportReference } from "@/lib/report-design";

import type { VehicleReport } from "@/lib/types";

import { hasVehicleSpecContent } from "@/lib/vehicle-spec-sheet";

import { ReportShell } from "./ReportShell";

import { VehicleSpecReportSection } from "./VehicleSpecReportSection";

import {
  chunkItems,
  FACTORY_FEATURES_PER_PRINT_SHEET,
} from "@/lib/factory-equipment-layout";

export function VehicleSpecReportPage({
  report,
  pageLabel,
  factoryPageLabels,
  trailingContent,
}: {
  report: VehicleReport;
  pageLabel: string;
  /** One label per factory sheet when options are split for print. */
  factoryPageLabels?: string[];
  trailingContent?: ReactNode;
}) {
  const sheet = report.vehicleSpec;
  if (!sheet || !hasVehicleSpecContent(sheet)) return null;

  const baseShell = {
    reportId: report.id,
    generatedAt: report.createdAt,
    reportReference: formatReportReference(report.vehicle),
  };

  const factoryLabels = factoryPageLabels?.filter((l) => l?.trim()) ?? [];
  const splitFactory =
    sheet.factoryFeatures.length > 0 && factoryLabels.length > 0;

  if (!splitFactory) {
    return (
      <div className="report-page-break report-sheet-pin-footer">
        <ReportShell
          {...baseShell}
          className="report-shell-spec report-shell-spec-full"
          pageLabel={pageLabel}
        >
          <div className="space-y-6">
            <VehicleSpecReportSection report={report} part="full" />
            {trailingContent}
          </div>
        </ReportShell>
      </div>
    );
  }

  const featureChunks = chunkItems(
    sheet.factoryFeatures,
    FACTORY_FEATURES_PER_PRINT_SHEET,
  );

  return (
    <>
      <div className="report-page-break report-sheet-pin-footer report-spec-data-sheet">
        <ReportShell
          {...baseShell}
          className="report-shell-spec report-shell-spec-full"
          pageLabel={pageLabel}
        >
          <VehicleSpecReportSection report={report} part="data" />
        </ReportShell>
      </div>

      {featureChunks.map((chunk, index) => {
        const patchedReport: VehicleReport = {
          ...report,
          vehicleSpec: {
            ...sheet,
            factoryFeatures: chunk,
          },
        };
        const isLast = index === featureChunks.length - 1;
        return (
          <div
            key={`factory-sheet-${index}`}
            className="report-page-break report-sheet-pin-footer report-spec-factory-sheet"
          >
            <ReportShell
              {...baseShell}
              className={`report-shell-spec report-shell-spec-full report-shell-spec-factory${
                index > 0 ? " report-shell-spec-factory-continued" : ""
              }`}
              pageLabel={factoryLabels[index] ?? factoryLabels[factoryLabels.length - 1]}
            >
              <div className="space-y-6">
                <VehicleSpecReportSection
                  report={patchedReport}
                  part="factory"
                  compactFactoryHeader={index > 0}
                />
                {isLast ? trailingContent : null}
              </div>
            </ReportShell>
          </div>
        );
      })}
    </>
  );
}
