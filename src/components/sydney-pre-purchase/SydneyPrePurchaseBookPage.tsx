"use client";

import { useSearchParams } from "next/navigation";
import {
  SydneyPpiFooter,
  SydneyPpiHeader,
  PAGE_CONTAINER,
} from "./sydney-ppi-chrome";
import { SydneyPpiPage } from "./sydney-ppi-layout";
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
    <SydneyPpiPage>
      <SydneyPpiHeader />
      <PrePurchaseBookingSection
        defaultVehicleCategory={defaultCategory}
        containerClassName={PAGE_CONTAINER}
        pageIntro={
          <>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-400">
              Booking request
            </p>
            <h1 className="mt-3 text-[clamp(1.85rem,4vw,2.5rem)] font-extrabold leading-tight text-white">
              Book inspection
            </h1>
            <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-slate-400 sm:text-base">
              Send the vehicle details and the suburb it is in. We reply with a
              fixed price and the next available inspection time — usually
              within one business day.
            </p>
          </>
        }
      />
      <SydneyPpiFooter />
    </SydneyPpiPage>
  );
}