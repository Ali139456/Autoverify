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
};

export function PricingTierCards({
  rego,
  state,
  showHeading = true,
}: PricingTierCardsProps) {
  const checkoutReady = Boolean(rego && state);

  return (
    <div>
      {showHeading && (
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
            <span className="text-accent-400">Auto Verifi Insights</span>
            <span className="text-white"> — </span>
            Past, Present and Future insights to buy with confidence
          </h2>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6">
        {REPORT_TIER_ORDER.map((tier) => (
          <TierCard
            key={tier}
            tier={tier}
            rego={rego}
            state={state}
            checkoutReady={checkoutReady}
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
}: {
  tier: ReportTier;
  rego?: string;
  state?: string;
  checkoutReady: boolean;
}) {
  const config = getReportTierConfig(tier);
  const isPlus = tier === "insights_plus";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 ${
        isPlus
          ? "border-accent-500/40 bg-gradient-to-b from-accent-700/30 to-ink-900/90"
          : "border-white/10 bg-ink-900/90"
      }`}
    >
      {isPlus && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-accent-400/40 bg-accent-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-300">
          <Sparkles className="h-3 w-3" aria-hidden />
          Recommended
        </span>
      )}

      <p className="text-sm font-semibold text-white sm:text-base">{config.name}</p>
      <p className="mt-3 text-4xl font-extrabold text-accent-400 sm:text-5xl">
        {formatTierPrice(tier)}
      </p>
      <p className="mt-2 text-sm text-slate-400">{config.tagline}</p>

      <ul className="mt-5 space-y-2 text-sm text-slate-300">
        {config.highlights.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-accent-400" aria-hidden>
              •
            </span>
            {item}
          </li>
        ))}
      </ul>

      <div className="mt-6">
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
