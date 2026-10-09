import { formatPPlateStatus } from "@/lib/report-design";
import {
  isPPlateAdvisoryCopy,
  P_PLATE_REFERENCE_ROWS,
} from "@/lib/p-plate-reference";
import {
  RIDE_SHARE_ELIGIBILITY_ROWS,
  RIDE_SHARE_TABLE_HEADING,
} from "@/lib/ride-share-eligibility";
import type { VehicleReport } from "@/lib/types";

const P_PLATE_ORANGE = "#E87722";

export function ReportValuationSupplements({
  report,
}: {
  report: VehicleReport;
}) {
  const pPlateStatus = formatPPlateStatus(report.vehicle);

  return (
    <div className="report-valuation-supplements space-y-5">
      <div className="report-pplate-status rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="report-section-heading">P plate status</h3>
        <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <th
                  scope="row"
                  className="report-spec-data-label w-[38%] px-4 py-2.5 font-medium text-slate-600"
                >
                  P plate eligibility
                </th>
                <td
                  className={`px-4 py-2.5 font-semibold ${
                    isPPlateAdvisoryCopy(pPlateStatus)
                      ? ""
                      : "text-slate-900"
                  }`}
                  style={
                    isPPlateAdvisoryCopy(pPlateStatus)
                      ? { color: P_PLATE_ORANGE }
                      : undefined
                  }
                >
                  {pPlateStatus}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="report-section-heading mt-5">
          Official P-plate vehicle/legal reference
        </h3>
        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-[520px] w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-3 py-2.5 font-bold uppercase tracking-wide text-slate-500 sm:px-4">
                  State
                </th>
                <th className="px-3 py-2.5 font-bold uppercase tracking-wide text-slate-500 sm:px-4">
                  State link references
                </th>
              </tr>
            </thead>
            <tbody>
              {P_PLATE_REFERENCE_ROWS.map((row) => (
                <tr
                  key={row.state}
                  className="border-t border-slate-100 align-top"
                >
                  <th
                    scope="row"
                    className="report-spec-data-label px-3 py-2.5 font-medium text-slate-600 sm:px-4"
                  >
                    {row.state}
                  </th>
                  <td className="px-3 py-2.5 sm:px-4">
                    <a
                      href={row.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#0073E3] underline underline-offset-2 hover:text-[#0062c2]"
                    >
                      {row.label}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="report-rideshare-eligibility rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="report-section-heading">{RIDE_SHARE_TABLE_HEADING}</h3>
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-[640px] w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-3 py-2.5 font-bold uppercase tracking-wide text-slate-500 sm:px-4">
                  Eligibility requirement
                </th>
                <th className="px-3 py-2.5 font-bold uppercase tracking-wide text-slate-500 sm:px-4">
                  UberX
                </th>
                <th className="px-3 py-2.5 font-bold uppercase tracking-wide text-slate-500 sm:px-4">
                  DiDi
                </th>
              </tr>
            </thead>
            <tbody>
              {RIDE_SHARE_ELIGIBILITY_ROWS.map((row) => (
                <tr
                  key={row.requirement}
                  className="border-t border-slate-100 align-top"
                >
                  <th
                    scope="row"
                    className="report-spec-data-label px-3 py-2.5 font-medium text-slate-600 sm:px-4"
                  >
                    {row.requirement}
                  </th>
                  <td className="px-3 py-2.5 text-slate-700 sm:px-4">{row.uberX}</td>
                  <td className="px-3 py-2.5 text-slate-700 sm:px-4">{row.didi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
