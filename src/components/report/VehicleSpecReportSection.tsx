import { formatReportDate } from "@/lib/report-design";
import type { VehicleReport } from "@/lib/types";
import { hasVehicleSpecContent } from "@/lib/vehicle-spec-sheet";
import { VehicleHeroImage } from "./VehicleHeroImage";

export function VehicleSpecReportSection({ report }: { report: VehicleReport }) {
  const sheet = report.vehicleSpec;
  if (!hasVehicleSpecContent(sheet)) return null;

  const { vehicle } = report;
  const vehicleTitle =
    `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.variant}`.trim();

  return (
    <section className="report-spec-sheet rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Vehicle data &amp; factory equipment
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{vehicleTitle}</h2>
          <p className="mt-1 text-xs text-slate-500">
            Captured {formatReportDate(sheet!.capturedAt)} from registration and
            build data sources.
          </p>
        </div>
        <div className="report-spec-hero-thumb relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-slate-900 lg:h-48 lg:w-64">
          <VehicleHeroImage
            vehicle={vehicle}
            vehicleTitle={vehicleTitle}
            className="relative h-full w-full"
            imageClassName="h-full w-full object-contain object-center"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Vehicle data
          </h3>
          <dl className="report-spec-data-table mt-3 overflow-hidden rounded-xl border border-slate-200">
            {sheet!.dataRows.map((row) => (
              <div
                key={row.label}
                className="report-spec-data-row grid grid-cols-[minmax(0,42%)_1fr] border-t border-slate-200 text-sm first:border-t-0"
              >
                <dt className="report-spec-data-label border-r border-slate-200 bg-slate-50 px-4 py-2.5 font-medium text-slate-600">
                  {row.label}
                </dt>
                <dd className="bg-white px-4 py-2.5 font-semibold text-slate-900">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Factory features &amp; options
          </h3>
          {sheet!.factoryFeatures.length > 0 ? (
            <ul className="mt-3 space-y-2 rounded-xl border border-slate-200 p-4">
              {sheet!.factoryFeatures.map((feature) => (
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
                      <span className="ml-1 text-xs text-slate-400">
                        ({feature.code})
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
              No factory option list was returned for this vehicle. Additional
              build data may become available when AutoGrab build features are
              enabled for this variant.
            </p>
          )}
        </div>
      </div>

    </section>
  );
}
