import { Check } from "lucide-react";
import {
  PPI_BOOKING_GROUP_LABELS,
  PPI_BOOKING_INCLUDED,
} from "@/lib/pre-purchase/ppi-booking-includes";
import type { PpiVehicleCategory } from "@/lib/pre-purchase/vehicle-pricing";
import { PrePurchaseBookingForm } from "./PrePurchaseBookingForm";

export function PrePurchaseBookingSection({
  defaultVehicleCategory,
  containerClassName = "av-site-container",
  pageIntro,
}: {
  defaultVehicleCategory?: PpiVehicleCategory;
  /** Match Sydney PPI chrome width (`PAGE_CONTAINER`) on `/sydneyprepurchase/book`. */
  containerClassName?: string;
  /** Optional hero copy above the form (Sydney book page — same black canvas as form). */
  pageIntro?: React.ReactNode;
} = {}) {
  return (
    <section className="w-full min-w-0 bg-black pb-16 pt-12 sm:pb-20 sm:pt-14">
      <div className={containerClassName}>
        {pageIntro ? (
          <div className="mb-10 max-w-2xl sm:mb-12">{pageIntro}</div>
        ) : null}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-start lg:gap-10 xl:gap-12">
          <PrePurchaseBookingForm
            variant="dark"
            requestFlow
            showVehicleCategory
            defaultVehicleCategory={defaultVehicleCategory}
          />
          <div className="space-y-4 lg:pt-1">
            <Sheet title="What's included">
              <ul className="space-y-3.5">
                {PPI_BOOKING_INCLUDED.map((line) => (
                  <li
                    key={line}
                    className="flex gap-2.5 text-[0.925rem] leading-snug text-slate-300"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent-400"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </Sheet>
            <Sheet title="Inspection groups">
              <ul className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
                {PPI_BOOKING_GROUP_LABELS.map((label) => (
                  <li key={label} className="text-sm text-slate-500">
                    {label}
                  </li>
                ))}
              </ul>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
}

function Sheet({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a1222] p-5 sm:p-6">
      <h3 className="text-[0.95rem] font-bold text-white">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}