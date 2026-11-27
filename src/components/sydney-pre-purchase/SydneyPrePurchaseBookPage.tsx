"use client";

import { useSearchParams } from "next/navigation";
import {
  SydneyPpiFooter,
  SydneyPpiHeader,
  PAGE_CONTAINER,
} from "./sydney-ppi-chrome";
import { PrePurchaseBookingSection } from "@/components/pre-purchase/PrePurchaseBookingSection";
import {
  normalizePpiVehicleCategory,
  type PpiVehicleCategory,
} from "@/lib/pre-purchase/vehicle-pricing";

export function SydneyPrePurchaseBookPage() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("vehicleCategory");
  const defaultCategory = normalizePpiVehicleCategory(
    raw,
  ) as PpiVehicleCategory;

  return (
    <div className="min-h-screen bg-black text-white">
      <SydneyPpiHeader />
      <section className="border-b border-white/10 bg-[#03060c]">
        <div className={`${PAGE_CONTAINER} py-12 sm:py-14`}>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-400">
            Booking request
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
            Book inspection
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400">
            Send the vehicle details and the suburb it is in. We reply with a
            fixed price and the next available inspection time — usually within
            one business day.
          </p>
        </div>
      </section>
      <PrePurchaseBookingSection defaultVehicleCategory={defaultCategory} />
      <SydneyPpiFooter />
    </div>
  );
}