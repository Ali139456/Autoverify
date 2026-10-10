import {
  formatExpiryDate,
  hasOdometerHistory,
  ODOMETER_HISTORY_LISTING_LINE,
  odometerHistoryCountLabel,
  readingAtPurchaseOfReportDetail,
} from "@/lib/report-design";
import type { VehicleReport } from "@/lib/types";

export function ReportOdometerHistoryTable({ report }: { report: VehicleReport }) {
  const history = report.vehicle.odometerHistory ?? [];
  if (!hasOdometerHistory(report.vehicle)) return null;

  const purchaseLine = readingAtPurchaseOfReportDetail(report.vehicle);

  return (
    <div className="report-supplementary report-odometer-history rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h3 className="report-section-heading flex-1 min-w-[200px]">
          Odometer history
        </h3>
        <p className="pb-2 text-[10px] font-semibold uppercase tracking-wide text-[#0073E3]">
          {odometerHistoryCountLabel(history.length)}
        </p>
      </div>
      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[480px] border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-3 py-2.5 font-bold uppercase tracking-wide text-slate-500 sm:px-4">
                Date
              </th>
              <th className="px-3 py-2.5 font-bold uppercase tracking-wide text-slate-500 sm:px-4">
                Odometer
              </th>
              <th className="px-3 py-2.5 font-bold uppercase tracking-wide text-slate-500 sm:px-4">
                Source
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr
                key={`${entry.date}-${entry.odometer}-${index}`}
                className={`border-t border-slate-100 align-top ${
                  index % 2 === 1 ? "report-table-row-shaded" : "bg-white"
                }`}
              >
                <td className="px-3 py-2.5 font-semibold text-slate-900 sm:px-4">
                  {formatExpiryDate(entry.date)}
                </td>
                <td className="px-3 py-2.5 font-bold text-[#0073E3] sm:px-4">
                  {entry.odometer.toLocaleString("en-AU")} km
                </td>
                <td className="px-3 py-2.5 text-slate-700 sm:px-4">
                  {entry.source?.trim() || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-600">
        {ODOMETER_HISTORY_LISTING_LINE}
      </p>
      {purchaseLine ? (
        <p className="mt-1 text-xs leading-relaxed text-slate-600">{purchaseLine}</p>
      ) : null}
    </div>
  );
}
