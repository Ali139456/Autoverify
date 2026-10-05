import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { HomeCheckLink } from "@/components/HomeCheckLink";
import {
  formatTierPrice,
  REPORT_TIER_ORDER,
  getReportTierConfig,
} from "@/lib/pricing";
import type { ReportTier } from "@/lib/types";
import { PayButton } from "@/components/PayButton";
import { SampleReportLink } from "@/components/SampleReportLink";

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

      <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:items-stretch sm:gap-6">
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

function TierProductTitle({ tier }: { tier: ReportTier }) {
  const lines =
    tier === "insights_plus"
      ? (["Auto Verifi", "Insights+", "Report"] as const)
      : (["Auto Verifi", "Insights", "Report"] as const);

  return (
    <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-white sm:text-base">
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </p>
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
  const cardShell =
    "relative flex h-full flex-col overflow-hidden rounded-2xl border-2 border-accent-500 p-5 shadow-sm sm:p-8 dark:shadow-none";
  const cardBg = isPlus
    ? "bg-gradient-to-b from-blue-50 to-white dark:from-accent-700/40 dark:to-ink-950"
    : "bg-white dark:bg-ink-800";
  const cardSelected = isSelected ? "ring-2 ring-accent-500" : "";

  return (
    <div className={`${cardShell} ${cardBg} ${cardSelected}`}>
      <div className="flex min-h-0 flex-col gap-2 sm:min-h-[4.25rem] sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0 sm:flex-1">
          <TierProductTitle tier={tier} />
        </div>
        {isPlus ? (
          <span className="inline-flex w-fit max-w-full items-center gap-1.5 self-start rounded-full border border-accent-500/35 bg-accent-50 px-2.5 py-1 text-[10px] font-semibold leading-snug text-accent-800 shadow-sm dark:border-accent-400/45 dark:bg-accent-500/15 dark:text-accent-200 sm:max-w-[13rem] sm:gap-2 sm:px-3 sm:py-1.5 sm:text-[11px]">
            <Sparkles className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" aria-hidden />
            Includes AI powered condition scan
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-4xl font-extrabold text-accent-500 sm:text-5xl">
        {formatTierPrice(tier)}
      </p>
      <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-900 dark:text-slate-300">
        {config.tagline}
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

      <div className="mt-6 space-y-3 pt-2">
        {checkoutReady && onSelectTier ? (
          <button
            type="button"
            onClick={() => onSelectTier(tier)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-accent-500 sm:text-base"
          >
            Buy report
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : checkoutReady ? (
          <PayButton
            identifier={identifier!}
            state={state}
            isVin={isVin}
            tier={tier}
            label="Buy report"
            requireEmail={false}
            agreedTerms
          />
        ) : (
          <HomeCheckLink
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-accent-600 sm:text-base"
          >
            Buy Report
            <ArrowRight className="h-4 w-4" aria-hidden />
          </HomeCheckLink>
        )}
        <SampleReportLink tier={tier} variant="outline" />
      </div>
    </div>
  );
}
