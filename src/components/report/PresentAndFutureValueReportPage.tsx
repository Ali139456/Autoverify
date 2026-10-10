import type { ReactNode } from "react";
import type { VehicleReport } from "@/lib/types";
import {
  getFutureValueAtYears,
  formatReportReference,
  futureValueForecastNote,
  presentValuationNote,
  resolveFutureValue,
  resolveValuation,
} from "@/lib/report-design";
import { ReportComparableVehicles } from "./ReportComparableVehicles";
import { ReportOdometerHistoryTable } from "./ReportOdometerHistoryTable";
import { ReportShell } from "./ReportShell";
import { ReportValuationSupplements } from "./ReportValuationSupplements";

export function PresentAndFutureValueReportPage({
  report,
  pageLabel,
  trailingContent,
}: {
  report: VehicleReport;
  pageLabel: string;
  /** Rendered at the end of the page body (e.g. the general disclaimer). */
  trailingContent?: ReactNode;
}) {
  const valuation = resolveValuation(report);
  const futureValue = resolveFutureValue(report);
  const valuationNote = presentValuationNote(report);
  const futureHorizons = [
    { label: "Today", years: 0 },
    { label: "+1 year", years: 1 },
    { label: "+3 years", years: 3 },
    { label: "+5 years", years: 5 },
  ];

  return (
    <ReportShell
      reportId={report.id}
      generatedAt={report.createdAt}
      reportReference={formatReportReference(report.vehicle)}
      pageLabel={pageLabel}
      className="report-shell-valuations"
    >
      <div className="report-body space-y-6">
        <div className="report-supplementary report-present-value rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="report-section-heading">
            Present value — market valuation
          </h3>
          <div className="report-valuation-grid mt-3 grid gap-3 sm:grid-cols-3">
            {[
              ["Trade-in", valuation.tradeLow, valuation.tradeHigh],
              ["Private sale", valuation.privateLow, valuation.privateHigh],
              ["Dealer retail", valuation.retailLow, valuation.retailHigh],
            ].map(([label, low, high]) => (
              <div
                key={label as string}
                className="rounded-lg bg-white p-4 ring-1 ring-slate-200"
              >
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-base font-extrabold text-[#0073E3]">
                  ${(low as number).toLocaleString("en-AU")} – $
                  {(high as number).toLocaleString("en-AU")}
                </p>
              </div>
            ))}
          </div>
          {valuationNote ? (
            <p className="mt-3 text-xs leading-relaxed text-slate-600">
              {valuationNote}
            </p>
          ) : null}
        </div>

        <div className="report-supplementary report-future-section rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h3 className="report-section-heading">
              Future value forecast
            </h3>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0073E3]">
              Based on {futureValue.yearlyKms.toLocaleString()} km per year
            </p>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            {futureValueForecastNote(report)}
          </p>
          <div className="report-future-grid mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {futureHorizons.map(({ label, years }) => {
              const point = getFutureValueAtYears(futureValue, years);
              return (
                <div
                  key={label}
                  className="rounded-lg bg-white p-4 ring-1 ring-slate-200"
                >
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-base font-extrabold text-[#0073E3]">
                    {point ? `$${point.value.toLocaleString("en-AU")}` : "—"}
                  </p>
                  {point ? (
                    <p className="report-future-kms mt-1 text-[10px] text-slate-400">
                      {point.odometer.toLocaleString()} km
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
          <p className="report-future-note mt-3 text-[10px] leading-relaxed text-slate-400">
            Residual valuations are modelled from market data and assumed annual kilometres.
            Actual future value may differ based on condition, usage and market changes.
          </p>
        </div>

        <ReportOdometerHistoryTable report={report} />
        <ReportComparableVehicles report={report} />
        <ReportValuationSupplements report={report} />
        {trailingContent}
      </div>
    </ReportShell>
  );
}
