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
  rego?: string;
  state?: string;
  showHeading?: boolean;
  variant?: "dark" | "light";
};

export function PricingTierCards({
  rego,
  state,
  showHeading = true,
  variant = "dark",
}: PricingTierCardsProps) {
  const checkoutReady = Boolean(rego && state);
  const isLight = variant === "light";

  return (
    <div>
      {showHeading && (
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className={`text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            <span className="text-accent-600">Auto Verifi Insights</span>
            <span className={isLight ? "text-slate-900" : "text-white"}> — </span>
            Past, Present and Future insights to buy with confidence
          </h2>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:items-stretch sm:gap-6">
        {REPORT_TIER_ORDER.map((tier) => (
          <TierCard
            key={tier}
            tier={tier}
            rego={rego}
            state={state}
            checkoutReady={checkoutReady}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}

function TierCard({
  tier,
  rego,
  state,
  checkoutReady,
  variant,
}: {
  tier: ReportTier;
  rego?: string;
  state?: string;
  checkoutReady: boolean;
  variant: "dark" | "light";
}) {
  const config = getReportTierConfig(tier);
  const isPlus = tier === "insights_plus";
  const isLight = variant === "light";

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-2xl border p-6 sm:p-8 ${
        isLight
          ? isPlus
            ? "border-accent-500/30 bg-gradient-to-b from-blue-50 to-white shadow-sm"
            : "border-slate-200 bg-white shadow-sm"
          : isPlus
            ? "border-accent-500/40 bg-gradient-to-b from-accent-700/30 to-ink-900/90"
            : "border-white/10 bg-ink-900/90"
      }`}
    >
      {isPlus && (
        <span
          className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider ${
            isLight
              ? "border-accent-500/30 bg-accent-50 text-accent-700"
              : "border-accent-400/40 bg-accent-500/15 text-accent-300"
          }`}
        >
          <Sparkles className="h-3 w-3" aria-hidden />
          Includes Current Condition
        </span>
      )}

      <p
        className={`text-sm font-semibold sm:text-base ${
          isLight ? "text-slate-900" : "text-white"
        }`}
      >
        {config.name}
      </p>
      <p className="mt-3 text-4xl font-extrabold text-accent-600 sm:text-5xl">
        {formatTierPrice(tier)}
      </p>
      <p className={`mt-2 text-sm ${isLight ? "text-slate-600" : "text-slate-400"}`}>
        {config.tagline}
      </p>

      <ul className={`mt-5 flex-1 space-y-2 text-sm ${isLight ? "text-slate-700" : "text-slate-300"}`}>
        {config.highlights.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-accent-600" aria-hidden>
              •
            </span>
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-2">
        {checkoutReady ? (
          <PayButton
            rego={rego!}
            state={state!}
            tier={tier}
            label={`Get ${isPlus ? "Insights+" : "Insights"}`}
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
