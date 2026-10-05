import { CheckCircle2 } from "lucide-react";
import { evaluateRideShareQuickEligibility } from "@/lib/ride-share-eligibility";
import type { VehicleReport } from "@/lib/types";

const RIDE_SHARE_ORANGE = "#E87722";

export function ReportRideShareEligibilitySummary({
  report,
}: {
  report: VehicleReport;
}) {
  const check = evaluateRideShareQuickEligibility(
    report.vehicle,
    report,
    new Date(report.createdAt).getFullYear(),
  );

  return (
    <section
      className="report-rideshare-summary rounded-xl border border-slate-200 bg-white p-5 ring-1 ring-slate-100"
      aria-labelledby="rideshare-eligibility-heading"
    >
      <h2
        id="rideshare-eligibility-heading"
        className="text-xs font-bold uppercase tracking-wide text-slate-500"
      >
        Ride share eligibility
      </h2>

      {check.allEligible ? (
        <div
          className="mt-3 space-y-1.5 text-sm font-semibold"
          style={{ color: RIDE_SHARE_ORANGE }}
        >
          <p>Age — eligible</p>
          <p>Doors — eligible</p>
          <p>Passenger capacity — eligible</p>
          <p className="flex flex-wrap items-center gap-1.5 pt-1">
            <CheckCircle2
              className="h-4 w-4 shrink-0"
              style={{ color: RIDE_SHARE_ORANGE }}
              aria-hidden
            />
            <span>Check remaining requirements</span>
          </p>
          <p className="text-xs font-medium">Refer table below.</p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          This vehicle did not pass all quick age, door and passenger checks.
          See the ride share requirements table below for full platform rules.
        </p>
      )}
    </section>
  );
}
