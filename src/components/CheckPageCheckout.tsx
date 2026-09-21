"use client";

import { useState } from "react";
import { CheckoutBookingForm } from "@/components/CheckoutBookingForm";
import { PricingTierCards } from "@/components/PricingTierCards";
import type { ReportTier } from "@/lib/types";

export function CheckPageCheckout({
  identifier,
  state,
  isVin,
}: {
  identifier: string;
  state: string;
  isVin: boolean;
}) {
  const [selectedTier, setSelectedTier] = useState<ReportTier | null>(null);

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

      {selectedTier && (
        <div className="mt-8">
          <CheckoutBookingForm
            identifier={identifier}
            state={state}
            isVin={isVin}
            tier={selectedTier}
          />
        </div>
      )}
    </>
  );
}
