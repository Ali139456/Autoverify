import { formatReportDate } from "@/lib/report-design";
import type { VehicleReport } from "@/lib/types";
import {
  hasVehicleSpecContent,
  isPowerToWeightSpecRow,
  P_PLATE_POWER_TO_WEIGHT_FOOTNOTE,
  shouldShowPowerToWeightFootnote,
  visibleSpecDataRows,
} from "@/lib/vehicle-spec-sheet";

export type VehicleSpecSectionPart = "full" | "data" | "factory";

export function VehicleSpecReportSection({
  report,
  part = "full",
  compactFactoryHeader = false,
}: {
  report: VehicleReport;
  part?: VehicleSpecSectionPart;
  /** Shorter header on factory continuation print sheets. */
  compactFactoryHeader?: boolean;
}) {
  const sheet = report.vehicleSpec;
  if (!hasVehicleSpecContent(sheet)) return null;

  const { vehicle } = report;
  const vehicleTitle =
    `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.variant}`.trim();

  const showData = part === "full" || part === "data";
  const showFactory = part === "full" || part === "factory";

  return (
    <section className="report-spec-sheet rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      {showData ? (
        <>
          <div className="border-b border-slate-200 pb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Vehicle data &amp; factory equipment
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#0073E3]">{vehicleTitle}</h2>
            <p className="mt-1 text-xs text-slate-500">
              Captured {formatReportDate(sheet!.capturedAt)} from registration and
              build data sources.
            </p>
          </div>

          <div className={part === "full" ? "mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr]" : "mt-6"}>
            <div>
              <h3 className="report-section-heading">Vehicle data</h3>
              <div className="report-spec-data-table-wrap mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="report-spec-data-table w-full border-collapse text-sm">
                  <colgroup>
                    <col className="report-spec-data-col-label" />
                    <col className="report-spec-data-col-value" />
                  </colgroup>
                  <tbody>
                    {visibleSpecDataRows(sheet!.dataRows).map((row, rowIndex) => {
                      const powerRow = isPowerToWeightSpecRow(row.label);
                      return (
                        <tr
                          key={row.label}
                          className={`report-spec-data-row border-t border-slate-200 ${
                            rowIndex === 0 ? "border-t-0" : ""
                          }`}
                        >
                          <th
                            scope="row"
                            className={`report-spec-data-label px-4 py-2.5 text-left font-medium ${
                              powerRow
                                ? "report-spec-power-row font-semibold text-[#0073E3]"
                                : "text-slate-600"
                            }`}
                          >
                            {row.label}
                            {powerRow ? "*" : ""}
                          </th>
                          <td
                            className={`bg-white px-4 py-2.5 font-normal ${
                              powerRow
                                ? "report-spec-power-row font-medium text-[#0073E3]"
                                : "text-slate-900"
                            }`}
                          >
                            {row.value}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {shouldShowPowerToWeightFootnote(sheet!.dataRows) ? (
                <p className="report-spec-power-footnote mt-2 text-[11px] leading-relaxed text-[#0073E3]">
                  {P_PLATE_POWER_TO_WEIGHT_FOOTNOTE}
                </p>
              ) : null}
            </div>

            {part === "full" ? (
              <div className="report-spec-factory-column">
                <FactoryFeaturesBlock sheet={sheet!} />
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {showFactory && part !== "full" ? (
        <div className="report-spec-factory-column">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Vehicle data &amp; factory equipment (continued)
          </p>
          {compactFactoryHeader ? null : (
            <h2 className="mt-1 text-lg font-bold text-[#0073E3]">{vehicleTitle}</h2>
          )}
          <div className={compactFactoryHeader ? "mt-2" : "mt-4"}>
            <FactoryFeaturesBlock sheet={sheet!} />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function FactoryFeaturesBlock({
  sheet,
}: {
  sheet: NonNullable<VehicleReport["vehicleSpec"]>;
}) {
  return (
    <>
      <h3 className="report-section-heading report-spec-factory-heading">
        Factory features &amp; options
      </h3>
      {sheet.factoryFeatures.length > 0 ? (
        <ul className="report-spec-factory-list mt-3 space-y-2 rounded-xl border border-slate-200 p-4">
          {sheet.factoryFeatures.map((feature) => (
            <li
              key={`${feature.code ?? "opt"}-${feature.label}`}
              className="flex gap-2 text-sm text-slate-700"
            >
              <span className="text-[#0073E3]" aria-hidden>
                •
              </span>
              <span>
                {feature.label}
                {feature.code ? (
                  <span className="ml-1 text-xs text-slate-400">({feature.code})</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          No factory option list was returned for this vehicle.
        </p>
      )}
    </>
  );
}
