import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
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
  /** Use `#check` when cards are rendered on the homepage. */
  homePage?: boolean;
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
  homePage = false,
}: PricingTierCardsProps) {
  const checkHref = homePage ? "#check" : "/#check";
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
            checkHref={checkHref}
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
  checkHref,
}: {
  tier: ReportTier;
  identifier?: string;
  state?: string;
  isVin?: boolean;
  checkoutReady: boolean;
  variant: "dark" | "light";
  onSelectTier?: (tier: ReportTier) => void;
  selectedTier?: ReportTier | null;
  checkHref: string;
}) {
  const config = getReportTierConfig(tier);
  const isPlus = tier === "insights_plus";
  const isSelected = selectedTier === tier;
  const cardShell =
    "relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 p-6 shadow-sm dark:border-white/10 sm:p-8 dark:shadow-none";
  const cardBg = isPlus
    ? "bg-gradient-to-b from-blue-50 to-white dark:from-accent-700/40 dark:to-ink-950"
    : "bg-white dark:bg-ink-800";
  const cardSelected = isSelected ? "ring-2 ring-accent-500" : "";

  return (
    <div className={`${cardShell} ${cardBg} ${cardSelected}`}>
      {isPlus ? (
        <div className="mb-5 flex justify-end sm:mb-6">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-accent-500/35 bg-accent-50 px-4 py-2 text-xs font-semibold leading-snug text-accent-800 dark:border-accent-400/45 dark:bg-accent-500/15 dark:text-accent-200 sm:px-5 sm:py-2.5">
            <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Includes AI powered condition scan
          </span>
        </div>
      ) : null}

      <p className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
        {config.name}
      </p>
      <p className="mt-3 text-4xl font-extrabold text-accent-500 sm:text-5xl">
        {formatTierPrice(tier)}
      </p>
      <p className="mt-2 text-sm text-slate-900 dark:text-slate-300">
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
          <Link
            href={checkHref}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-accent-600 sm:text-base"
          >
            Buy Report
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
        <SampleReportLink tier={tier} variant="outline" />
      </div>
    </div>
  );
}
