"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { SampleReportLink } from "@/components/SampleReportLink";
import {
  isVin,
  parseVehicleIdentifier,
} from "@/lib/vehicle-identifier";
import { VEHICLE_SEARCH_INPUT_ID } from "@/lib/scroll-to-vehicle-search";
import { VehicleSearchLoading } from "@/components/VehicleSearchLoading";

const STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

export function RegoSearchForm({
  defaultRego = "",
  defaultVin = "",
  defaultState = "NSW",
  compact = false,
  onDark = false,
  inputId = VEHICLE_SEARCH_INPUT_ID,
  onLoadingChange,
}: {
  defaultRego?: string;
  defaultVin?: string;
  defaultState?: string;
  compact?: boolean;
  /** Force dark styling when the form sits on a navy hero background. */
  onDark?: boolean;
  /** Override the input id when more than one form is on the page (e.g. modal). */
  inputId?: string;
  /** Parent renders a full-panel overlay (e.g. buy modal). */
  onLoadingChange?: (loading: boolean) => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultVin || defaultRego);
  const [state, setState] = useState(defaultState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const vinMode = isVin(query);
  const externalLoadingOverlay = Boolean(onLoadingChange);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

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
    : onDark
      ? "mx-auto max-w-md rounded-2xl border border-white/10 bg-ink-800 p-2.5 sm:p-3 lg:mx-0"
      : "mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-2.5 shadow-lg dark:border-white/10 dark:bg-ink-800 dark:shadow-none sm:p-3 lg:mx-0";

  const fieldClass = onDark
    ? "h-10 w-full min-w-0 rounded-lg border border-white/15 bg-ink-950 text-sm font-bold outline-none transition placeholder:text-xs placeholder:font-semibold placeholder:normal-case placeholder:text-[#0073E3] focus:border-[#0073E3] focus:ring-2 focus:ring-[#0073E3]/25 sm:placeholder:text-sm sm:placeholder:font-bold sm:text-base"
    : "h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-900 outline-none transition placeholder:text-xs placeholder:font-normal placeholder:normal-case placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-white/15 dark:bg-ink-950 dark:font-black dark:text-white dark:placeholder:text-slate-500 sm:placeholder:text-sm sm:text-base";

  const labelClass = onDark
    ? "text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400"
    : "text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400";

  const regoTextClass =
    onDark && !query.trim()
      ? "text-[#0073E3]"
      : onDark
        ? "text-white"
        : "";

  return (
    <form onSubmit={onSubmit} className="relative w-full">
      {loading && !externalLoadingOverlay ? (
        <div
          className={`absolute inset-0 z-20 flex min-h-[12rem] w-full items-center justify-center rounded-2xl ${
            onDark
              ? "bg-ink-950 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
              : "bg-white dark:bg-ink-950"
          }`}
        >
          <VehicleSearchLoading embedded onDark={onDark} />
        </div>
      ) : null}
      <div className={`relative w-full ${shellClass}`}>
        <div className="mb-1 flex gap-2 text-left">
          <span className={`${labelClass} min-w-0 flex-1`}>
            Registration Plate or VIN
          </span>
          <span className={`${labelClass} w-[5.75rem] shrink-0 text-left`}>
            State{vinMode ? " (optional)" : ""}
          </span>
        </div>

        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <input
              id={inputId}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rego or VIN"
              aria-label="Registration plate or VIN"
              maxLength={17}
              className={`${fieldClass} px-3 text-left ${regoTextClass} ${!vinMode && query.trim() ? "plate-input uppercase" : ""}`}
            />
          </div>

          <div className="relative w-[5.75rem] shrink-0">
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              aria-label="State of registration"
              className={`${fieldClass} cursor-pointer appearance-none pl-3 pr-8 text-left text-sm font-bold sm:text-base`}
            >
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
              <ChevronDown className="h-3 w-3 text-accent-500 dark:text-accent-400" aria-hidden />
            </span>
          </div>
        </div>

        <div className="mx-auto mt-2.5 grid w-full grid-cols-2 gap-2 lg:mx-0">
          <button
            type="submit"
            disabled={loading}
            className="btn-shine group flex h-10 min-w-0 items-center justify-center gap-1 rounded-lg bg-[#0073E3] px-2.5 text-xs font-bold text-white transition hover:bg-[#0062c2] disabled:opacity-60 sm:gap-1.5 sm:px-4 sm:text-sm"
          >
            {loading ? "Searching…" : "Buy Report"}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </button>
          {!loading ? (
            <SampleReportLink tier="insights" variant="hero" />
          ) : (
            <Link
              href="/sample-report"
              className="pointer-events-none flex h-10 min-w-0 items-center justify-center rounded-lg border-2 border-[#0073E3]/40 px-2.5 text-xs font-bold text-[#0073E3]/40 sm:px-4 sm:text-sm"
              tabIndex={-1}
              aria-hidden
            >
              Sample Report
            </Link>
          )}
        </div>
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
