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
}: {
  report: VehicleReport;
  part?: VehicleSpecSectionPart;
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
            <h2 className="mt-1 text-xl font-bold text-slate-900">{vehicleTitle}</h2>
            <p className="mt-1 text-xs text-slate-500">
              Captured {formatReportDate(sheet!.capturedAt)} from registration and
              build data sources.
            </p>
          </div>

          <div className={part === "full" ? "mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr]" : "mt-6"}>
            <div>
              <h3 className="report-section-heading">Vehicle data</h3>
              <div className="report-spec-data-table-wrap mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
              <dl className="report-spec-data-table m-0">
                {visibleSpecDataRows(sheet!.dataRows).map((row) => {
                  const powerRow = isPowerToWeightSpecRow(row.label);
                  return (
                    <div
                      key={row.label}
                      className="report-spec-data-row grid grid-cols-[minmax(0,42%)_1fr] border-t border-slate-200 text-sm first:border-t-0"
                    >
                      <dt
                        className={`report-spec-data-label px-4 py-2.5 font-medium ${
                          powerRow
                            ? "report-spec-power-row font-semibold text-[#0073E3]"
                            : "text-slate-600"
                        }`}
                      >
                        {row.label}
                        {powerRow ? "*" : ""}
                      </dt>
                      <dd
                        className={`bg-white px-4 py-2.5 font-normal ${
                          powerRow
                            ? "report-spec-power-row font-medium text-[#0073E3]"
                            : "text-slate-900"
                        }`}
                      >
                        {row.value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
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
          <h2 className="mt-1 text-lg font-bold text-slate-900">{vehicleTitle}</h2>
          <div className="mt-4">
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
      <h3 className="report-section-heading">Factory features &amp; options</h3>
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
