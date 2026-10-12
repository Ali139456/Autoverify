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



export function ReportPPlateSupplement({ report }: { report: VehicleReport }) {

  const pPlateStatus = formatPPlateStatus(report.vehicle);



  return (

    <div className="report-pplate-status min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">

      <h3 className="report-section-heading">P plate status</h3>

      <div className="mt-3 min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white">

        <table className="w-full table-fixed border-collapse text-left text-[11px] sm:text-sm">

          <tbody>

            <tr className="border-b border-slate-100">

              <th

                scope="row"

                className="report-spec-data-label w-[36%] px-2 py-2 font-medium text-slate-600 sm:px-4 sm:py-2.5"

              >

                P plate eligibility

              </th>

              <td

                className={`px-2 py-2 font-semibold break-words leading-snug sm:px-4 sm:py-2.5 ${

                  isPPlateAdvisoryCopy(pPlateStatus) ? "" : "text-slate-900"

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

        P-plate vehicle/legal reference

      </h3>

      <div className="report-table-scroll mt-2 min-w-0 max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white [-webkit-overflow-scrolling:touch] sm:overflow-x-visible">

        <table className="w-full min-w-0 table-fixed border-collapse text-left text-[11px] sm:min-w-[520px] sm:table-auto sm:text-sm">

          <colgroup className="sm:hidden">
            <col className="w-[32%]" />
            <col className="w-[68%]" />
          </colgroup>

          <thead>

            <tr className="border-b border-slate-200 bg-slate-50">

              <th className="px-2 py-2 font-bold uppercase tracking-wide text-slate-500 sm:px-4 sm:py-2.5">

                State

              </th>

              <th className="px-2 py-2 font-bold uppercase tracking-wide text-slate-500 sm:px-4 sm:py-2.5">

                <span className="sm:hidden">Link</span>

                <span className="hidden sm:inline">State link references</span>

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

                  className="report-spec-data-label px-2 py-2 font-medium text-slate-600 sm:px-4 sm:py-2.5"

                >

                  {row.state}

                </th>

                <td className="px-2 py-2 sm:px-4 sm:py-2.5">

                  <a

                    href={row.href}

                    target="_blank"

                    rel="noopener noreferrer"

                    className="font-medium text-[#0073E3] underline underline-offset-2 break-words [overflow-wrap:anywhere] hover:text-[#0062c2]"

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

  );

}



export function ReportRideShareSupplement() {

  return (

    <div className="report-rideshare-eligibility min-w-0 max-w-full rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">

      <h3 className="report-section-heading">{RIDE_SHARE_TABLE_HEADING}</h3>

      <div className="report-table-scroll mt-3 min-w-0 max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white [-webkit-overflow-scrolling:touch] sm:overflow-x-visible">

        <table className="w-full min-w-0 table-fixed border-collapse text-left text-[10px] leading-snug sm:min-w-[640px] sm:table-auto sm:text-xs md:text-sm">

          <colgroup className="sm:hidden">
            <col className="w-[38%]" />
            <col className="w-[31%]" />
            <col className="w-[31%]" />
          </colgroup>

          <thead>

            <tr className="border-b border-slate-200 bg-slate-50">

              <th className="px-1.5 py-2 font-bold uppercase tracking-wide text-slate-500 sm:px-4 sm:py-2.5">

                <span className="sm:hidden">Requirement</span>

                <span className="hidden sm:inline">Eligibility requirement</span>

              </th>

              <th className="px-1.5 py-2 font-bold uppercase tracking-wide text-slate-500 sm:px-4 sm:py-2.5">

                UberX

              </th>

              <th className="px-1.5 py-2 font-bold uppercase tracking-wide text-slate-500 sm:px-4 sm:py-2.5">

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

                  className="report-spec-data-label px-1.5 py-2 font-medium text-slate-600 break-words sm:px-4 sm:py-2.5"

                >

                  {row.requirement}

                </th>

                <td className="px-1.5 py-2 text-slate-700 break-words sm:px-4 sm:py-2.5">{row.uberX}</td>

                <td className="px-1.5 py-2 text-slate-700 break-words sm:px-4 sm:py-2.5">{row.didi}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}



export function ReportValuationSupplements({

  report,

}: {

  report: VehicleReport;

}) {

  return (

    <div className="report-valuation-supplements min-w-0 max-w-full space-y-5">

      <ReportPPlateSupplement report={report} />

      <ReportRideShareSupplement />

    </div>

  );

}


