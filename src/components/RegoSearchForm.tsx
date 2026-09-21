"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import {
  isVin,
  parseVehicleIdentifier,
} from "@/lib/vehicle-identifier";

const STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

export function RegoSearchForm({
  defaultRego = "",
  defaultVin = "",
  defaultState = "NSW",
  compact = false,
}: {
  defaultRego?: string;
  defaultVin?: string;
  defaultState?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultVin || defaultRego);
  const [state, setState] = useState(defaultState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const vinMode = isVin(query);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseVehicleIdentifier(query);
    if (!parsed) {
      setError("Enter a valid registration plate or 17-character VIN.");
      return;
    }
    if (parsed.kind === "rego" && !STATES.includes(state)) {
      setError("Please select a valid state.");
      return;
    }

    setError(null);
    setLoading(true);

    if (parsed.kind === "vin") {
      const params = new URLSearchParams({ vin: parsed.value });
      if (state) params.set("state", state);
      router.push(`/check?${params.toString()}`);
      return;
    }

    router.push(
      `/check?rego=${encodeURIComponent(parsed.value)}&state=${state}`,
    );
  }

  const shellClass = compact
    ? ""
    : "mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-2.5 shadow-lg dark:border-white/10 dark:bg-ink-800 dark:shadow-none sm:p-3 lg:mx-0";

  const fieldClass =
    "h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:normal-case placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-white/15 dark:bg-ink-950 dark:font-black dark:text-white dark:placeholder:text-slate-500 sm:text-base";

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className={`w-full ${shellClass}`}>
        <div className="mb-1 grid grid-cols-2 gap-2 px-1 text-left">
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Registration Plate or VIN
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            State{vinMode ? " (optional)" : ""}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative min-w-0">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Rego or VIN Here"
              aria-label="Registration plate or VIN"
              maxLength={17}
              className={`${fieldClass} px-3 text-left ${!vinMode && query.trim() ? "plate-input uppercase" : ""}`}
            />
          </div>

          <div className="relative min-w-0">
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              aria-label="State of registration"
              className={`${fieldClass} cursor-pointer appearance-none pl-3 pr-8 text-center font-bold`}
            >
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
              <ChevronDown className="h-3 w-3 text-accent-500 dark:text-accent-400" aria-hidden />
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-shine group mx-auto mt-2.5 flex h-10 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-accent-500 px-4 text-sm font-bold text-white transition hover:bg-accent-600 disabled:opacity-60 sm:w-1/2"
        >
          {loading ? "Searching…" : "Buy Report"}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </button>
      </div>
      {error && (
        <p
          className="mt-2 text-sm font-medium text-red-600 dark:text-red-400"
          role="alert"
        >
          {error}
        </p>
      )}
    </form>
  );
}
