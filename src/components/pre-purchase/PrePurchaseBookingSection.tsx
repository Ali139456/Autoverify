import { Check } from "lucide-react";
import {
  PPI_BOOKING_GROUP_LABELS,
  PPI_BOOKING_INCLUDED,
} from "@/lib/pre-purchase/ppi-booking-includes";
import type { PpiVehicleCategory } from "@/lib/pre-purchase/vehicle-pricing";
import { PrePurchaseBookingForm } from "./PrePurchaseBookingForm";

export function PrePurchaseBookingSection({
  defaultVehicleCategory,
}: {
  defaultVehicleCategory?: PpiVehicleCategory;
} = {}) {
  return (
    <section className="border-t border-white/10 bg-black py-14 sm:py-16">
      <div className="av-site-container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-12">
          <PrePurchaseBookingForm
            variant="dark"
            requestFlow
            showVehicleCategory
            defaultVehicleCategory={defaultVehicleCategory}
          />
          <div className="space-y-4">
            <Sheet title="What's included">
              <ul className="space-y-3">
                {PPI_BOOKING_INCLUDED.map((line) => (
                  <li
                    key={line}
                    className="flex gap-2.5 text-sm leading-snug text-slate-300"
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent-400"
                      aria-hidden
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </Sheet>
            <Sheet title="Inspection groups">
              <ul className="grid gap-2 sm:grid-cols-2">
                {PPI_BOOKING_GROUP_LABELS.map((label) => (
                  <li
                    key={label}
                    className="text-sm text-slate-400"
                  >
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
    <div className="rounded-2xl border border-white/10 bg-[#0c1528] p-5 sm:p-6">
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}