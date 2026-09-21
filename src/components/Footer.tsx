import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Lock,
  Mail,
  MapPin,
} from "lucide-react";
import { Logo } from "@/components/Logo";

const QUICK_LINKS = [
  { href: "/#check", label: "Check a vehicle" },
  { href: "/pricing", label: "Pricing" },
  { href: "/vehicleinspections", label: "Vehicle inspections" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#whats-included", label: "What's included" },
  { href: "/#about", label: "About us" },
  { href: "/#faq", label: "FAQ" },
];

const CHECKS = [
  "PPSR / finance owing",
  "Write-off & stolen records",
  "Vehicle specifications",
  "ANCAP safety ratings",
  "Market valuation & comparables",
  "AI photo damage analysis",
];

const CONTACT_EMAIL = "info@autoverifi.com.au";
const OFFICE_ADDRESS = "Level 35, 100 Barangaroo Avenue, Sydney NSW 2000";

export function Footer() {
  return (
    <footer className="av-site-footer relative mt-auto overflow-hidden border-t border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-ink-950">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-accent-500/25 bg-gradient-to-r from-blue-50 via-white to-white p-6 text-center dark:from-accent-700/25 dark:via-ink-800 dark:to-ink-800 sm:gap-6 sm:p-8 md:flex-row md:justify-between md:text-left lg:p-10">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl lg:text-3xl">
              Ready to know what you&apos;re buying?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
              Past, present and future insights — in your hands in under two minutes.
            </p>
          </div>
          <Link
            href="/#check"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-600 sm:px-8 sm:py-4 sm:text-base"
          >
            Buy Report
            <ArrowRight
              className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo height={36} />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            We combine official history records, live market data and AI
            powered damage analysis so you can buy your next car with
            confidence.
          </p>
        </div>

        <div className="md:col-span-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">
            Quick links
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {QUICK_LINKS.map((l) => (
              <li key={l.href + l.label}>
                <Link
                  href={l.href}
                  className="group inline-flex items-center gap-2 text-slate-600 transition-colors hover:text-accent-600 dark:text-slate-400 dark:hover:text-accent-400"
                >
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-colors group-hover:text-accent-600 dark:text-white dark:group-hover:text-accent-400"
                    aria-hidden
                  />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white">
            What we check
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
            {CHECKS.map((c) => (
              <li key={c} className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" aria-hidden />
                {c}
              </li>
            ))}
          </ul>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-5 inline-flex items-center gap-2 text-sm text-slate-600 transition hover:text-accent-600 dark:text-slate-400 dark:hover:text-accent-400"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>

      <div className="relative border-t border-slate-200 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <p>© {new Date().getFullYear()} Auto Verifi. All rights reserved.</p>
            <p className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-accent-500" aria-hidden />
              {OFFICE_ADDRESS}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end sm:gap-5">
            <Link href="/terms" className="hover:text-accent-400">
              Terms of Use
            </Link>
            <Link href="/privacy" className="hover:text-accent-400">
              Privacy Policy
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-1.5 hover:text-accent-400"
            >
              <Mail className="h-3.5 w-3.5 text-accent-500" aria-hidden />
              Contact us
            </a>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-accent-500" aria-hidden />
              SSL encrypted
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-accent-500" aria-hidden />
              Payments by Stripe
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
