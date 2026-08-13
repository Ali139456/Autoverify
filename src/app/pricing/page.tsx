import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PricingTierCards } from "@/components/PricingTierCards";

export const metadata: Metadata = {
  title: "Pricing — Auto Verifi Insights",
  description:
    "Auto Verifi Insights from $39 or Insights+ from $89. PPSR checks, live valuation, AI forecasting and optional Ravin photo damage analysis.",
};

export default function PricingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent-600/15 blur-[130px]" />
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:py-24">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Simple, honest <span className="text-gradient-blue">pricing</span>
          </h1>
          <p className="mt-3 text-base text-slate-400 sm:text-lg">
            No subscriptions. No hidden fees. Pay once per report.
          </p>
        </div>

        <div className="mt-10 sm:mt-12">
          <PricingTierCards showHeading={false} />
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/#check"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-8 py-4 text-lg font-bold text-white transition hover:bg-accent-500"
          >
            Check a rego
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
          <p className="mt-3 text-xs text-slate-500">
            Secure payment via Stripe · Instant delivery
          </p>
        </div>
      </div>
    </div>
  );
}
