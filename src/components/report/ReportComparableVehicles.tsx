import { comparableListingsShowDaysListed } from "@/lib/report-design";
import type { VehicleReport } from "@/lib/types";



export const REPORT_COMPARABLE_VEHICLE_ROWS = 5;



/** "Comparable vehicles for sale" table — mirrors the PDF on report page 2. */

export function ReportComparableVehicles({ report }: { report: VehicleReport }) {

  const listings = report.market.comparableListings.slice(

    0,

    REPORT_COMPARABLE_VEHICLE_ROWS,

  );

  if (listings.length === 0) return null;

  const showDaysListed = comparableListingsShowDaysListed(listings);

  return (

    <div className="report-supplementary report-comparables rounded-xl border border-slate-200 bg-slate-50 p-5">

      <div className="flex flex-wrap items-end justify-between gap-2">

        <h3 className="report-section-heading flex-1 min-w-[200px]">

          Comparable vehicles for sale

        </h3>

        {report.market.activeListings ? (

          <p className="pb-2 text-[10px] font-semibold uppercase tracking-wide text-[#0073E3]">

            {report.market.activeListings.toLocaleString("en-AU")} similar vehicles

            listed nationally

          </p>

        ) : null}

      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">

        <table className="w-full min-w-[520px] border-collapse text-left text-xs sm:text-sm">

          <thead>

            <tr className="border-b border-slate-200 bg-slate-50">

              <th className="px-3 py-2.5 font-bold uppercase tracking-wide text-slate-500 sm:px-4">

                Vehicle

              </th>

              <th className="px-3 py-2.5 font-bold uppercase tracking-wide text-slate-500 sm:px-4">

                Price

              </th>

              <th className="px-3 py-2.5 font-bold uppercase tracking-wide text-slate-500 sm:px-4">

                Odometer

              </th>

              <th className="px-3 py-2.5 font-bold uppercase tracking-wide text-slate-500 sm:px-4">

                Location

              </th>

              {showDaysListed ? (
                <th className="px-3 py-2.5 font-bold uppercase tracking-wide text-slate-500 sm:px-4">
                  Listed
                </th>
              ) : null}

            </tr>

          </thead>

          <tbody>

            {listings.map((listing, index) => (

              <tr

                key={`${listing.title}-${index}`}

                className={`border-t border-slate-100 align-top ${

                  index % 2 === 1 ? "report-table-row-shaded" : "bg-white"

                }`}

              >

                <td className="px-3 py-2.5 font-semibold text-slate-900 sm:px-4">

                  {listing.title}

                </td>

                <td className="px-3 py-2.5 font-bold text-[#0073E3] sm:px-4">

                  ${listing.price.toLocaleString("en-AU")}

                </td>

                <td className="px-3 py-2.5 text-slate-700 sm:px-4">

                  {listing.odometer.toLocaleString("en-AU")} km

                </td>

                <td className="px-3 py-2.5 text-slate-700 sm:px-4">

                  {listing.location}

                </td>

                {showDaysListed ? (
                  <td className="px-3 py-2.5 text-slate-700 sm:px-4">
                    {listing.daysListed}d
                  </td>
                ) : null}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}


