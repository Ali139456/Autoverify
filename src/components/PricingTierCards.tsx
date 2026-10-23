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
  onSelectTier,
  selectedTier = null,
}: PricingTierCardsProps) {
  const checkoutId = identifier ?? rego;
  const checkoutReady = Boolean(checkoutId && (isVin || state));
  const checkoutFlow = Boolean(onSelectTier);

  return (
    <div className="w-full min-w-0 max-w-full">
      {showHeading && (
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
            <span className="text-accent-600">Auto Verifi Insights</span>
            <span className="text-slate-900 dark:text-white"> — </span>
            Past, Present and Future insights to buy with confidence
          </h2>
        </div>
      )}

      <div
        className={
          checkoutFlow
            ? "mt-6 grid w-full min-w-0 grid-cols-2 items-stretch gap-2 sm:mt-10 sm:gap-6"
            : "mt-8 grid w-full min-w-0 grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:items-stretch sm:gap-6"
        }
      >
        {REPORT_TIER_ORDER.map((tier) => (
          <TierCard
            key={tier}
            tier={tier}
            identifier={checkoutId}
            state={state}
            isVin={isVin}
            checkoutReady={checkoutReady}
            onSelectTier={onSelectTier}
            selectedTier={selectedTier}
            compact={checkoutFlow}
          />
        ))}
      </div>
    </div>
  );
}

function TierProductTitle({
  tier,
  compact,
}: {
  tier: ReportTier;
  compact?: boolean;
}) {
  const isPlus = tier === "insights_plus";

  return (
    <h3
      className={`text-balance font-semibold leading-snug text-slate-900 dark:text-white ${
        compact ? "text-[11px] sm:text-lg" : "text-base sm:text-lg"
      }`}
    >
      <span className="block">Auto Verifi</span>
      <span className="block">{isPlus ? "Insights+" : "Insights"}</span>
      <span className="block">Report</span>
    </h3>
  );
}

function TierCard({
  tier,
  identifier,
  state,
  isVin,
  checkoutReady,
  onSelectTier,
  selectedTier,
  compact = false,
}: {
  tier: ReportTier;
  identifier?: string;
  state?: string;
  isVin?: boolean;
  checkoutReady: boolean;
  onSelectTier?: (tier: ReportTier) => void;
  selectedTier?: ReportTier | null;
  compact?: boolean;
}) {
  const config = getReportTierConfig(tier);
  const isPlus = tier === "insights_plus";
  const isSelected = selectedTier === tier;
  const cardShell = compact
    ? "relative box-border flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden rounded-xl border border-accent-500 px-2.5 py-3 shadow-sm sm:rounded-2xl sm:border-2 sm:px-8 sm:py-8 dark:shadow-none"
    : "relative box-border flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden rounded-2xl border border-accent-500 px-4 py-5 shadow-sm sm:border-2 sm:px-8 sm:py-8 dark:shadow-none";
  const cardBg = isPlus
    ? "bg-gradient-to-b from-blue-50 to-white dark:from-accent-700/40 dark:to-ink-950"
    : "bg-white dark:bg-ink-800";
  const cardSelected = isSelected ? "ring-2 ring-accent-500" : "";

  return (
    <div className={`${cardShell} ${cardBg} ${cardSelected}`}>
      <div
        className={
          compact
            ? "flex min-h-0 flex-col gap-1 sm:min-h-[4.25rem] sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            : "flex min-h-0 items-start justify-between gap-3 sm:min-h-[4.25rem] sm:gap-4"
        }
      >
        <div className="min-w-0 flex-1 pr-1">
          <TierProductTitle tier={tier} compact={compact} />
        </div>
        {isPlus ? (
          <p
            className={`inline-flex items-center gap-1 text-left font-semibold leading-tight text-accent-500 ${
              compact
                ? "text-[9px] sm:text-[11px]"
                : "shrink-0 text-[10px] sm:text-[11px]"
            }`}
          >
            <Sparkles
              className={`shrink-0 text-accent-500 ${compact ? "h-2.5 w-2.5 sm:h-3 sm:w-3" : "h-3 w-3"}`}
              aria-hidden
            />
            <span className={compact ? "text-pretty sm:whitespace-nowrap" : "whitespace-nowrap"}>
              {compact ? "AI condition scan" : "Includes AI powered condition scan"}
            </span>
          </p>
        ) : null}
      </div>
      <p
        className={`mt-2 font-extrabold tabular-nums text-accent-500 sm:mt-3 ${
          compact ? "text-xl sm:text-4xl lg:text-5xl" : "text-3xl sm:text-4xl lg:text-5xl"
        }`}
      >
        {formatTierPrice(tier)}
      </p>
      <p
        className={`text-pretty leading-relaxed text-slate-900 dark:text-slate-300 ${
          compact ? "mt-1 hidden text-sm sm:mt-2 sm:block" : "mt-2 text-sm"
        }`}
      >
        {config.tagline}
      </p>

      <ul
        className={`flex-1 text-slate-700 dark:text-slate-300 ${
          compact
            ? "mt-2 hidden space-y-1.5 text-xs sm:mt-5 sm:block sm:space-y-2.5 sm:text-sm"
            : "mt-5 space-y-2.5 text-sm"
        }`}
      >
        {config.highlights.map((item) => {
          const text = typeof item === "string" ? item : item.text;
          const accent = typeof item === "object" && item.accent;
          return (
            <li key={text} className="flex min-w-0 gap-2.5">
              <span className="shrink-0 text-accent-600" aria-hidden>
                •
              </span>
              <span
                className={`min-w-0 break-words ${
                  accent
                    ? "font-medium text-accent-600 dark:text-accent-400"
                    : ""
                }`}
              >
                {text}
              </span>
            </li>
          );
        })}
      </ul>

      <div className={`space-y-2 pt-1 sm:space-y-3 sm:pt-2 ${compact ? "mt-3 sm:mt-6" : "mt-6"}`}>
        {checkoutReady && onSelectTier ? (
          <button
            type="button"
            onClick={() => onSelectTier(tier)}
            className={`inline-flex w-full items-center justify-center gap-1 rounded-lg bg-accent-600 font-bold text-white transition hover:bg-accent-500 sm:gap-2 sm:rounded-xl sm:px-6 sm:py-3.5 sm:text-base ${
              compact ? "px-2 py-2.5 text-[11px]" : "px-6 py-3.5 text-sm"
            }`}
          >
            Buy report
            <ArrowRight className={compact ? "h-3 w-3 sm:h-4 sm:w-4" : "h-4 w-4"} aria-hidden />
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
        <SampleReportLink
          tier={tier}
          variant="outline"
          className={compact ? "hidden sm:inline-flex" : undefined}
        />
      </div>
    </div>
  );
}
