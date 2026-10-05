import { MANUFACTURERS_WARRANTY_NOTICE } from "@/lib/report-design";

const BRAND_ORANGE = "#E87722";

export function ReportManufacturersWarrantyNotice() {
  return (
    <section
      className="report-manufacturers-warranty rounded-xl border border-slate-200 bg-slate-100 p-5"
      aria-labelledby="manufacturers-warranty-heading"
    >
      <h2
        id="manufacturers-warranty-heading"
        className="text-sm font-bold"
        style={{ color: BRAND_ORANGE }}
      >
        Manufacturers Warranty Remaining
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {MANUFACTURERS_WARRANTY_NOTICE}
      </p>
    </section>
  );
}
