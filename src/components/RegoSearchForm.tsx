"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Lock, ShieldCheck, Zap } from "lucide-react";

const STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

export function RegoSearchForm({
  defaultRego = "",
  defaultState = "NSW",
  compact = false,
}: {
  defaultRego?: string;
  defaultState?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [rego, setRego] = useState(defaultRego);
  const [state, setState] = useState(defaultState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = rego.trim().toUpperCase().replace(/\s+/g, "");
    if (!/^[A-Z0-9]{1,9}$/.test(cleaned)) {
      setError("Enter a valid registration plate (letters and numbers only).");
      return;
    }
    setError(null);
    setLoading(true);
    router.push(`/check?rego=${encodeURIComponent(cleaned)}&state=${state}`);
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div
        className={`w-full ${
          compact
            ? ""
            : "mx-auto max-w-md rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-ink-800/60 p-2.5 backdrop-blur-xl sm:p-3 lg:mx-0"
        }`}
      >
        {/* Field labels */}
        <div className="mb-1 grid grid-cols-2 gap-2 px-1 text-left">
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Registration plate
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
            State
          </span>
        </div>

        {/* Row 1: plate + state, equal widths */}
        <div className="grid grid-cols-2 gap-2">
          {/* Number-plate style input */}
          <div className="relative min-w-0">
            <span className="absolute inset-y-0 left-0 z-10 flex w-7 flex-col items-center justify-center gap-0.5 rounded-l-lg bg-gradient-to-b from-accent-500 to-accent-700">
              <span className="h-1 w-1 rounded-full border border-white/70" />
              <span className="text-[7px] font-black tracking-widest text-white">
                AUS
              </span>
            </span>
            <input
              value={rego}
              onChange={(e) => setRego(e.target.value)}
              placeholder="ABC 123"
              aria-label="Registration plate"
              maxLength={9}
              className="plate-input h-10 w-full min-w-0 rounded-lg border border-white/15 bg-ink-950 pl-8 pr-2 text-center text-sm font-black text-white outline-none transition placeholder:text-slate-600 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 sm:text-base"
            />
          </div>

          {/* State select with custom chevron */}
          <div className="relative min-w-0">
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              aria-label="State of registration"
              className="h-10 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-white/15 bg-ink-950 pl-3 pr-8 text-center text-sm font-bold text-white outline-none transition focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 sm:text-base"
            >
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <ChevronDown className="h-3 w-3 text-accent-400" aria-hidden />
            </span>
          </div>
        </div>

        {/* Row 2: centered submit button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-shine group mx-auto mt-2.5 flex h-10 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-gradient-to-r from-accent-600 via-accent-500 to-accent-600 px-4 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60 sm:w-1/2"
        >
          {loading ? "Searching…" : "Buy Report"}
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </button>

        {/* Trust row */}
        {!compact && (
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-white/5 pt-2.5 text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Zap className="h-2.5 w-2.5 text-accent-400" aria-hidden />
              Instant report
            </span>
            <span className="inline-flex items-center gap-1">
              <Lock className="h-2.5 w-2.5 text-accent-400" aria-hidden />
              Secure Stripe payment
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-2.5 w-2.5 text-accent-400" aria-hidden />
              PPSR &amp; write-off checks
            </span>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm font-medium text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
