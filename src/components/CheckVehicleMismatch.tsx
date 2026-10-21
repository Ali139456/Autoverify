"use client";

import { VehicleFacetPicker } from "@/components/VehicleFacetPicker";
import type { VehicleLookupMismatchKind } from "@/lib/vehicle-lookup-errors";
import {
  CARS_ONLY_AVAILABILITY_NOTE,
  FACET_MANUAL_SELECT_HINT,
} from "@/lib/autograb-catalogue";

export function CheckVehicleMismatch({
  kind,
  message,
  upstreamVehicle,
  rego,
  vin,
  state,
  tier,
}: {
  kind: VehicleLookupMismatchKind;
  message: string;
  upstreamVehicle?: string;
  rego?: string;
  vin?: string;
  state: string;
  tier?: "insights" | "insights_plus";
}) {
  const showFacetPicker = kind === "reduced_confidence";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-left sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        {kind === "non_car_asset" || kind === "unsupported_asset_category"
          ? "Cars only for now"
          : "We need your help identifying this vehicle"}
      </h1>

      <p className="mt-3 text-slate-600 dark:text-slate-400">
        {kind === "non_car_asset" || kind === "unsupported_asset_category"
          ? CARS_ONLY_AVAILABILITY_NOTE
          : message || FACET_MANUAL_SELECT_HINT}
      </p>

      {upstreamVehicle ? (
        <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-white/10 dark:bg-ink-900/40 dark:text-slate-300">
          Register record:{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {upstreamVehicle}
          </span>
        </p>
      ) : null}

      {showFacetPicker ? (
        <VehicleFacetPicker
          rego={rego}
          vin={vin}
          state={state}
          tier={tier}
        />
      ) : null}
    </div>
  );
}
