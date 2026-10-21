"use client";

import { useEffect, useState } from "react";
import { CheckoutBookingForm } from "@/components/CheckoutBookingForm";
import { PricingTierCards } from "@/components/PricingTierCards";
import type { ReportTier } from "@/lib/types";
import type { AutograbAssetCategory } from "@/lib/autograb-catalogue";

export function CheckPageCheckout({
  identifier,
  state,
  isVin,
  initialTier = "insights",
  catalogueVehicleId,
  assetCategory = "conventional",
}: {
  identifier: string;
  state: string;
  isVin: boolean;
  initialTier?: ReportTier;
  catalogueVehicleId?: string;
  assetCategory?: AutograbAssetCategory;
}) {
  const [selectedTier, setSelectedTier] = useState<ReportTier>(initialTier);

  useEffect(() => {
    if (initialTier === "insights_plus") {
      requestAnimationFrame(() => {
        document
          .getElementById("checkout-details")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [initialTier]);

  function handleSelectTier(tier: ReportTier) {
    setSelectedTier(tier);
    requestAnimationFrame(() => {
      document
        .getElementById("checkout-details")
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
        onSelectTier={handleSelectTier}
        selectedTier={selectedTier}
      />

      <div className="mt-6 sm:mt-8">
          <CheckoutBookingForm
            identifier={identifier}
            state={state}
            isVin={isVin}
            tier={selectedTier}
            catalogueVehicleId={catalogueVehicleId}
            assetCategory={assetCategory}
          />
      </div>
    </>
  );
}
