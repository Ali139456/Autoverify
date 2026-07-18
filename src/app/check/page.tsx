import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeDollarSign,
  Brain,
  Camera,
  CheckCircle2,
  FileText,
  History,
  Lock,
} from "lucide-react";
import { lookupVehicle } from "@/lib/autograb";
import { formatPrice } from "@/lib/stripe";
import { AustralianState } from "@/lib/types";
import { PayButton } from "@/components/PayButton";
import { RegoSearchForm } from "@/components/RegoSearchForm";

export const metadata: Metadata = {
  title: "Vehicle Preview",
  robots: { index: false },
};

const STATES: AustralianState[] = ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"];

const INCLUDED = [
  { icon: History, text: "PPSR, finance, write-off & stolen checks" },
  { icon: BadgeDollarSign, text: "Trade-in, private & retail valuations" },
  { icon: Brain, text: "AI risk score & 5-year depreciation forecast" },
  { icon: Camera, text: "AI photo damage analysis (upload after purchase)" },
  { icon: FileText, text: "Downloadable professional PDF report" },
];

export default async function CheckPage({
  searchParams,
}: {
  searchParams: Promise<{ rego?: string; state?: string; cancelled?: string }>;
}) {
  const params = await searchParams;
  const rego = (params.rego ?? "").toUpperCase().trim();
  const state = (params.state ?? "").toUpperCase() as AustralianState;
  const cancelled = params.cancelled === "1";

  if (!/^[A-Z0-9]{1,9}$/.test(rego) || !STATES.includes(state)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-bold text-white">Check a vehicle</h1>
        <p className="mt-2 text-slate-400">
          Enter a registration plate and state to get started.
        </p>
        <div className="mt-6">
          <RegoSearchForm compact />
        </div>
      </div>
    );
  }

  let lookup;
  let lookupError: string | null = null;
  try {
    lookup = await lookupVehicle(rego, state);
  } catch (err) {
    lookupError =
      err instanceof Error ? err.message : "We couldn't find that vehicle.";
  }

  if (!lookup) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-white">Vehicle not found</h1>
        <p className="mt-2 text-slate-400">{lookupError}</p>
        <div className="mx-auto mt-8 max-w-xl">
          <RegoSearchForm defaultRego={rego} defaultState={state} compact />
        </div>
      </div>
    );
  }

  const { vehicle } = lookup;

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-[130px]" />
      <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        {cancelled && (
          <div className="mb-6 rounded-xl border border-accent-500/40 bg-accent-500/10 p-4 text-sm text-accent-300">
            Payment was cancelled. Your report is still one click away below.
          </div>
        )}

        <p className="text-sm font-medium text-slate-400">
          Vehicle found for <span className="font-bold text-white">{rego}</span>{" "}
          ({state})
        </p>

        {/* Vehicle card */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-ink-800/70">
          <div className="border-b border-white/10 bg-gradient-to-r from-accent-700/30 to-transparent px-6 py-5">
            <div className="flex items-center gap-2 text-accent-400">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Vehicle identified
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-slate-400">{vehicle.variant}</p>
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
                <dd className="mt-0.5 font-semibold text-white">
                  {value || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Locked report + CTA */}
        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-ink-800/70 p-6 lg:col-span-3">
            <div className="flex items-center gap-2 text-white">
              <Lock className="h-5 w-5 text-accent-400" aria-hidden />
              <h2 className="text-lg font-bold">Full report includes</h2>
            </div>
            <ul className="mt-4 space-y-3">
              {INCLUDED.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm text-slate-300">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden />
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-center rounded-2xl border border-accent-500/30 bg-ink-800/70 p-6 lg:col-span-2">
            <p className="text-center text-sm text-slate-400">One-off payment</p>
            <p className="text-center text-4xl font-extrabold text-white">
              {formatPrice()}
            </p>
            <div className="mt-5">
              <PayButton rego={rego} state={state} label="Unlock full report" />
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Not the right car?{" "}
          <Link href="/" className="font-semibold text-accent-400 hover:underline">
            Search again
          </Link>
        </p>
      </div>
    </div>
  );
}
