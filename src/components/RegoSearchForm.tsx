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
            : "glow-blue rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-ink-800/60 p-4 backdrop-blur-xl sm:p-5"
        }`}
      >
        {/* Field labels */}
        <div className="mb-2 grid grid-cols-2 gap-3 px-1 text-left">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Registration plate
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            State
          </span>
        </div>

        {/* Row 1: plate + state, equal widths */}
        <div className="grid grid-cols-2 gap-3">
          {/* Number-plate style input */}
          <div className="relative min-w-0">
            <span className="absolute inset-y-0 left-0 z-10 flex w-10 flex-col items-center justify-center gap-1 rounded-l-xl bg-gradient-to-b from-accent-500 to-accent-700 sm:w-12">
              <span className="h-2 w-2 rounded-full border border-white/70" />
              <span className="text-[9px] font-black tracking-widest text-white sm:text-[10px]">
                AUS
              </span>
            </span>
            <input
              value={rego}
              onChange={(e) => setRego(e.target.value)}
              placeholder="ABC 123"
              aria-label="Registration plate"
              maxLength={9}
              className="plate-input h-14 w-full min-w-0 rounded-xl border-2 border-white/15 bg-ink-950 pl-12 pr-3 text-center text-lg font-black text-white outline-none transition placeholder:text-slate-600 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/20 sm:pl-14 sm:text-2xl"
            />
          </div>

          {/* State select with custom chevron */}
          <div className="relative min-w-0">
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              aria-label="State of registration"
              className="h-14 w-full min-w-0 cursor-pointer appearance-none rounded-xl border-2 border-white/15 bg-ink-950 pl-4 pr-12 text-center text-lg font-bold text-white outline-none transition focus:border-accent-500 focus:ring-4 focus:ring-accent-500/20"
            >
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <ChevronDown className="h-4 w-4 text-accent-400" aria-hidden />
            </span>
          </div>
        </div>

        {/* Row 2: centered submit button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-shine group mx-auto mt-4 flex h-14 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-gradient-to-r from-accent-600 via-accent-500 to-accent-600 px-5 text-lg font-bold text-white shadow-[0_0_28px_rgba(59,130,246,0.45)] transition hover:shadow-[0_0_44px_rgba(59,130,246,0.7)] disabled:opacity-60 sm:w-1/2"
        >
          {loading ? "Searching…" : "Buy Report"}
          <ArrowRight
            className="h-5 w-5 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </button>

        {/* Trust row */}
        {!compact && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/5 pt-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-accent-400" aria-hidden />
              Instant report
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-accent-400" aria-hidden />
              Secure Stripe payment
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent-400" aria-hidden />
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
