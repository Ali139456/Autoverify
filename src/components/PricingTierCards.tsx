import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  formatTierPrice,
  REPORT_TIER_ORDER,
  getReportTierConfig,
} from "@/lib/pricing";
import type { ReportTier } from "@/lib/types";
import { PayButton } from "@/components/PayButton";

type PricingTierCardsProps = {
  /** Registration plate or VIN used for checkout. */
  identifier?: string;
  /** @deprecated Use `identifier` instead. */
  rego?: string;
  state?: string;
  isVin?: boolean;
  showHeading?: boolean;
  variant?: "dark" | "light";
  /** When set, tier cards select a plan instead of paying inline. */
  onSelectTier?: (tier: ReportTier) => void;
  selectedTier?: ReportTier | null;
};

export function PricingTierCards({
  identifier,
  rego,
  state,
  isVin = false,
  showHeading = true,
  variant = "light",
  onSelectTier,
  selectedTier = null,
}: PricingTierCardsProps) {
  const checkoutId = identifier ?? rego;
  const checkoutReady = Boolean(checkoutId && (isVin || state));

  return (
    <div>
      {showHeading && (
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
            <span className="text-accent-600">Auto Verifi Insights</span>
            <span className="text-slate-900 dark:text-white"> — </span>
            Past, Present and Future insights to buy with confidence
          </h2>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:items-stretch sm:gap-6">
        {REPORT_TIER_ORDER.map((tier) => (
          <TierCard
            key={tier}
            tier={tier}
            identifier={checkoutId}
            state={state}
            isVin={isVin}
            checkoutReady={checkoutReady}
            variant={variant}
            onSelectTier={onSelectTier}
            selectedTier={selectedTier}
          />
        ))}
      </div>
    </div>
  );
}

function TierCard({
  tier,
  identifier,
  state,
  isVin,
  checkoutReady,
  variant,
  onSelectTier,
  selectedTier,
}: {
  tier: ReportTier;
  identifier?: string;
  state?: string;
  isVin?: boolean;
  checkoutReady: boolean;
  variant: "dark" | "light";
  onSelectTier?: (tier: ReportTier) => void;
  selectedTier?: ReportTier | null;
}) {
  const config = getReportTierConfig(tier);
  const isPlus = tier === "insights_plus";
  const isSelected = selectedTier === tier;
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 sm:p-8 ${
        isPlus
          ? `border-accent-500/30 bg-gradient-to-b from-blue-50 to-white shadow-sm dark:border-accent-500/50 dark:from-accent-700/40 dark:to-ink-950 dark:shadow-none ${isSelected ? "ring-2 ring-accent-500" : ""}`
          : `border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-ink-800 dark:shadow-none ${isSelected ? "ring-2 ring-accent-500" : ""}`
      }`}
    >
      {isPlus && (
        <span
          className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-accent-500/30 bg-accent-50 px-2.5 py-1 text-[10px] font-bold tracking-wider text-accent-700 dark:border-accent-400/40 dark:bg-accent-500/15 dark:text-accent-300"
        >
          <Sparkles className="h-3 w-3" aria-hidden />
          Includes AI powered damage detection
        </span>
      )}

      <p className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
        {config.name}
      </p>
      <p className="mt-3 text-4xl font-extrabold text-accent-600 sm:text-5xl">
        {formatTierPrice(tier)}
      </p>
      <p className="mt-2 text-sm text-slate-900 dark:text-slate-300">
        {config.tagline}
        {config.taglineAccent ? (
          <>
            {" "}
            <span className="font-medium text-accent-600 dark:text-accent-400">
              {config.taglineAccent}
            </span>
          </>
        ) : null}
      </p>

      <ul className="mt-5 flex-1 space-y-2 text-sm text-slate-700 dark:text-slate-300">
        {config.highlights.map((item) => {
          const text = typeof item === "string" ? item : item.text;
          const accent = typeof item === "object" && item.accent;
          return (
            <li key={text} className="flex gap-2">
              <span className="text-accent-600" aria-hidden>
                •
              </span>
              <span
                className={
                  accent
                    ? "font-medium text-accent-600 dark:text-accent-400"
                    : undefined
                }
              >
                {text}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 pt-2">
        {checkoutReady && onSelectTier ? (
          <button
            type="button"
            onClick={() => onSelectTier(tier)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-accent-500 sm:text-base"
          >
            {isSelected ? "Selected" : `Get ${isPlus ? "Insights+" : "Insights"}`}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : checkoutReady ? (
          <PayButton
            identifier={identifier!}
            state={state}
            isVin={isVin}
            tier={tier}
            label={`Get ${isPlus ? "Insights+" : "Insights"}`}
            requireEmail={false}
          />
        ) : (
          <Link
            href="/#check"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-accent-500 sm:text-base"
          >
            Get started
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
