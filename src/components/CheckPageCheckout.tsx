"use client";

import { useEffect, useState } from "react";
import { CheckoutBookingForm } from "@/components/CheckoutBookingForm";
import { PricingTierCards } from "@/components/PricingTierCards";
import type { ReportTier } from "@/lib/types";

export function CheckPageCheckout({
  identifier,
  state,
  isVin,
  initialTier = "insights",
}: {
  identifier: string;
  state: string;
  isVin: boolean;
  initialTier?: ReportTier;
}) {
  const [selectedTier, setSelectedTier] = useState<ReportTier>(initialTier);

  useEffect(() => {
    if (initialTier === "insights_plus") {
      requestAnimationFrame(() => {
        document
          .getElementById("booking-payment")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [initialTier]);

  function handleSelectTier(tier: ReportTier) {
    setSelectedTier(tier);
    requestAnimationFrame(() => {
      document
        .getElementById("booking-payment")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <>
      <PricingTierCards
        identifier={identifier}
        state={state}
        isVin={isVin}
        showHeading={false}
        variant="light"
        onSelectTier={handleSelectTier}
        selectedTier={selectedTier}
      />

      <div className="mt-6 sm:mt-8">
          <CheckoutBookingForm
            identifier={identifier}
            state={state}
            isVin={isVin}
            tier={selectedTier}
          />
      </div>
    </>
  );
}
