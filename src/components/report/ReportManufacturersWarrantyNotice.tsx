import { MANUFACTURERS_WARRANTY_NOTICE } from "@/lib/report-design";

export function ReportManufacturersWarrantyNotice() {
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
      <p className="mt-2 text-sm font-medium leading-relaxed text-[#E87722]">
        {MANUFACTURERS_WARRANTY_NOTICE}
      </p>
    </section>
  );
}
