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
        <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-slate-900 lg:h-40 lg:w-56">
          <VehicleHeroImage
            vehicle={vehicle}
            vehicleTitle={vehicleTitle}
            className="relative h-full w-full"
            imageClassName="h-full w-full object-cover object-center"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Vehicle data
          </h3>
          <dl className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {sheet!.dataRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-[minmax(0,42%)_1fr] gap-3 px-4 py-2.5 text-sm"
              >
                <dt className="font-medium text-slate-500">{row.label}</dt>
                <dd className="font-semibold text-slate-900">{row.value}</dd>
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
