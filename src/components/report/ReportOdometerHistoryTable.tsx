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
    <div className="report-supplementary report-odometer-history min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h3 className="report-section-heading min-w-0 flex-1">
          Odometer history
        </h3>
        <p className="max-w-full pb-2 text-left text-[9px] font-semibold uppercase leading-snug tracking-wide text-[#0073E3] sm:text-[10px]">
          {odometerHistoryCountLabel(history.length)}
        </p>
      </div>
      <div className="report-table-scroll mt-3 min-w-0 max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white [-webkit-overflow-scrolling:touch] sm:overflow-x-visible">
        <table className="w-full min-w-0 table-fixed border-collapse text-left text-[11px] sm:min-w-[480px] sm:table-auto sm:text-sm">
          <colgroup className="sm:hidden">
            <col className="w-[28%]" />
            <col className="w-[32%]" />
            <col className="w-[40%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-2 py-2 font-bold uppercase tracking-wide text-slate-500 sm:px-4 sm:py-2.5">
                Date
              </th>
              <th className="px-2 py-2 font-bold uppercase tracking-wide text-slate-500 sm:px-4 sm:py-2.5">
                <span className="sm:hidden">Odo</span>
                <span className="hidden sm:inline">Odometer</span>
              </th>
              <th className="px-2 py-2 font-bold uppercase tracking-wide text-slate-500 sm:px-4 sm:py-2.5">
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
                <td className="px-2 py-2 font-semibold tabular-nums text-slate-900 sm:px-4 sm:py-2.5">
                  {formatExpiryDate(entry.date)}
                </td>
                <td className="px-2 py-2 font-bold tabular-nums leading-snug text-[#0073E3] sm:px-4 sm:py-2.5">
                  {entry.odometer.toLocaleString("en-AU")} km
                </td>
                <td className="px-2 py-2 text-slate-700 break-words leading-snug sm:px-4 sm:py-2.5">
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
