import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { lookupVehicle } from "@/lib/autograb";
import { AustralianState } from "@/lib/types";
import {
  formatVehicleIdentifierLabel,
  parseVehicleIdentifier,
} from "@/lib/vehicle-identifier";
import { PricingTierCards } from "@/components/PricingTierCards";
import { RegoSearchForm } from "@/components/RegoSearchForm";

export const metadata: Metadata = {
  title: "Vehicle Preview",
  robots: { index: false },
};

const STATES: AustralianState[] = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

const pageShellClass = "min-h-[calc(100vh-6rem)] bg-white dark:bg-ink-950";

export default async function CheckPage({
  searchParams,
}: {
  searchParams: Promise<{
    rego?: string;
    vin?: string;
    state?: string;
    cancelled?: string;
  }>;
}) {
  const params = await searchParams;
  const rawIdentifier = (params.vin ?? params.rego ?? "").trim();
  const state = (params.state ?? "NSW").toUpperCase() as AustralianState;
  const cancelled = params.cancelled === "1";
  const parsed = parseVehicleIdentifier(rawIdentifier);
  const validState = STATES.includes(state);
  const needsState = parsed?.kind === "rego";

  if (!parsed || (needsState && !validState)) {
    return (
      <div className={pageShellClass}>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Check a vehicle</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Enter a registration plate and state, or a 17-character VIN, to get
            started.
          </p>
          <div className="mt-6">
            <RegoSearchForm compact />
          </div>
        </div>
      </div>
    );
  }

  let lookup;
  let lookupError: string | null = null;
  try {
    lookup = await lookupVehicle(
      parsed.value,
      parsed.kind === "rego" ? state : validState ? state : undefined,
    );
  } catch (err) {
    lookupError =
      err instanceof Error ? err.message : "We couldn't find that vehicle.";
  }

  const identifierLabel = formatVehicleIdentifierLabel(parsed, state);

  if (!lookup) {
    return (
      <div className={pageShellClass}>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Vehicle not found</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{lookupError}</p>
          <div className="mx-auto mt-8 max-w-xl">
            <RegoSearchForm
              defaultRego={parsed.kind === "rego" ? parsed.value : ""}
              defaultVin={parsed.kind === "vin" ? parsed.value : ""}
              defaultState={state}
              compact
            />
          </div>
        </div>
      </div>
    );
  }

  const { vehicle } = lookup;
  const checkoutIdentifier = parsed.value;
  const checkoutState = parsed.kind === "rego" ? state : validState ? state : "NSW";

  return (
    <div className={`relative overflow-hidden ${pageShellClass}`}>
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-[130px]" />
      <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        {cancelled && (
          <div className="mb-6 rounded-xl border border-accent-500/40 bg-accent-50 p-4 text-sm text-accent-700 dark:bg-accent-500/10 dark:text-accent-300">
            Payment was cancelled. Your report is still one click away below.
          </div>
        )}

        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Vehicle found for{" "}
          <span className="font-bold text-slate-900 dark:text-white">{identifierLabel}</span>
        </p>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-ink-800/70 dark:shadow-none">
          <div className="border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white px-6 py-5 dark:border-white/10 dark:from-accent-700/30 dark:to-transparent">
            <div className="flex items-center gap-2 text-accent-600 dark:text-accent-400">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Vehicle identified
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">{vehicle.variant}</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-6 sm:grid-cols-3">
            {[
              ["Body type", vehicle.bodyType],
              ["Engine", vehicle.engine],
              ["Fuel", vehicle.fuelType],
              ["Transmission", vehicle.transmission],
              ["Colour", vehicle.colour],
              ["VIN", vehicle.vin ? `${vehicle.vin.slice(0, 6)}•••••` : "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {label}
                </dt>
                <dd className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                  {value || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-10">
          <PricingTierCards
            identifier={checkoutIdentifier}
            state={checkoutState}
            isVin={parsed.kind === "vin"}
            showHeading={false}
            variant="light"
          />
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Not the right car?{" "}
          <Link href="/" className="font-semibold text-accent-600 hover:underline dark:text-accent-400">
            Search again
          </Link>
        </p>
      </div>
    </div>
  );
}
