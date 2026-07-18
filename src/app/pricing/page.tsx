import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { formatPrice } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Pricing — One Report, One Price",
  description:
    "One simple price for a complete car history check: PPSR, finance, write-off and stolen checks plus live valuation and AI future insights. No subscription.",
};

const FEATURES = [
  "Vehicle identification from rego plate",
  "Registration status & expiry",
  "PPSR / finance owing check",
  "Write-off & stolen record checks",
  "Trade-in, private sale & dealer retail valuations",
  "Live market comparables & pricing statistics",
  "AI risk score with detailed risk factors",
  "5-year AI depreciation forecast & residual value",
  "AI photo damage analysis (Ravin.ai)",
  "Professional downloadable PDF report",
];

export default function PricingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent-600/15 blur-[130px]" />
      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16 lg:py-24">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Simple, honest <span className="text-gradient-blue">pricing</span>
          </h1>
          <p className="mt-3 text-base text-slate-400 sm:text-lg">
            No subscriptions. No hidden fees. Pay once per report.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-accent-500/30 bg-ink-800/80 sm:mt-12">
          <div className="border-b border-white/10 bg-gradient-to-b from-accent-700/25 to-transparent px-5 py-8 text-center sm:px-8 sm:py-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent-400 sm:text-sm">
              Complete vehicle report
            </p>
            <p className="mt-3 text-4xl font-extrabold text-white sm:text-5xl">
              {formatPrice()}
            </p>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">per vehicle, one-off</p>
          </div>
          <ul className="grid gap-3 px-5 py-6 sm:grid-cols-2 sm:px-8 sm:py-8">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
          <div className="px-5 pb-8 text-center sm:px-8 sm:pb-10">
            <Link
              href="/#check"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent-600 px-8 py-4 text-lg font-bold text-white transition hover:bg-accent-500 sm:w-auto"
            >
              Buy Report
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
            <p className="mt-3 text-xs text-slate-500">
              Secure payment via Stripe · Instant delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
