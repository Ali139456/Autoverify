import type { VehicleIdentity } from "@/lib/types";
import {
  MANUFACTURERS_WARRANTY_NOTICE,
  SERVICE_HISTORY_DETAIL,
  SERVICE_HISTORY_STATUS_LABEL,
  formatWarrantyRemainingDisplay,
} from "@/lib/report-design";

export function ReportManufacturersWarrantyNotice({
  vehicle,
}: {
  vehicle?: VehicleIdentity;
}) {
  const warrantyExpiry = formatWarrantyRemainingDisplay(
    vehicle?.warrantyRemaining,
  );

  return (
    <section
      className="report-manufacturers-warranty rounded-xl border border-slate-200 bg-slate-100 p-5"
      aria-labelledby="manufacturers-warranty-heading"
    >
      <h2
        id="manufacturers-warranty-heading"
        className="text-xs font-bold uppercase tracking-wide text-slate-900"
      >
        Manufacturer&apos;s warranty remaining
      </h2>
      {warrantyExpiry ? (
        <p className="report-warranty-expiry mt-2 text-sm font-bold text-slate-900">
          Expiry {warrantyExpiry}
        </p>
      ) : null}
      <p className="mt-2 text-sm font-medium leading-relaxed text-[#E87722]">
        {MANUFACTURERS_WARRANTY_NOTICE}
      </p>
      <div className="report-service-history-notice mt-4 border-t border-slate-200 pt-4">
        <p className="text-sm font-medium text-slate-600">
          {SERVICE_HISTORY_STATUS_LABEL}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">
          {SERVICE_HISTORY_DETAIL}
        </p>
      </div>
    </section>
  );
}
