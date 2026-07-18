import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5Z" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.7 3H20l-5.6 6.4L21 21h-5.4l-4.2-5.5L6.6 21H4.3l6-6.9L3.5 3H9l3.8 5 4.9-5Zm-.9 16h1.4L7.1 4.4H5.6L16.8 19Z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M6.9 8.6H4V20h2.9V8.6ZM5.5 7.3a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4ZM20 13.4c0-3.1-1.7-4.6-3.9-4.6-1.6 0-2.4.9-2.8 1.6V8.6H10.4V20h2.9v-6c0-1.4.7-2.3 1.9-2.3 1.1 0 1.8.8 1.8 2.3v6H20v-6.6Z" />
    </svg>
  );
}

const QUICK_LINKS = [
  { href: "/#check", label: "Check a vehicle" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#whats-included", label: "What's included" },
  { href: "/#faq", label: "FAQ" },
];

const CHECKS = [
  "PPSR / finance owing",
  "Write-off & stolen records",
  "Market valuation & comparables",
  "AI depreciation forecast",
  "AI photo damage analysis",
];

const SOCIALS = [
  { icon: FacebookIcon, label: "Facebook", href: "#" },
  { icon: XIcon, label: "Twitter / X", href: "#" },
  { icon: InstagramIcon, label: "Instagram", href: "#" },
  { icon: LinkedInIcon, label: "LinkedIn", href: "#" },
];

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-ink-950">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-[120px]" />

      {/* CTA band */}
      <div className="relative mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-accent-500/25 bg-gradient-to-r from-accent-700/25 via-ink-800 to-ink-800 p-6 text-center sm:gap-6 sm:p-8 md:flex-row md:justify-between md:text-left lg:p-10">
          <div>
            <h2 className="text-xl font-extrabold text-white sm:text-2xl lg:text-3xl">
              Ready to know what you&apos;re buying?
            </h2>
            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Past, present and future insights — in your hands in under two minutes.
            </p>
          </div>
          <Link
            href="/#check"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-accent-600 to-accent-500 px-6 py-3 text-sm font-bold text-white transition hover:from-accent-500 hover:to-accent-400 sm:px-8 sm:py-4 sm:text-base"
          >
            Buy Report
            <ArrowRight
              className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-12">
        {/* Brand */}
        <div className="md:col-span-5">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-700">
              <ShieldCheck className="h-5 w-5 text-white" aria-hidden />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-white">
              AUTO <span className="text-gradient-blue">VERIFI</span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Australia&apos;s smarter vehicle report. We combine official history
            records, live market data and AI predictions so you can buy your
            next car with total confidence.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:border-accent-500/50 hover:bg-accent-500/10 hover:text-accent-400"
              >
                <Icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="md:col-span-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">
            Quick links
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {QUICK_LINKS.map((l) => (
              <li key={l.href + l.label}>
                <Link
                  href={l.href}
                  className="group inline-flex items-center gap-1.5 text-slate-400 transition hover:text-accent-400"
                >
                  <ArrowRight
                    className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                    aria-hidden
                  />
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* What we check */}
        <div className="md:col-span-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">
            What we check
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
            {CHECKS.map((c) => (
              <li key={c} className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" aria-hidden />
                {c}
              </li>
            ))}
          </ul>
          <a
            href="mailto:support@autoverifi.com"
            className="mt-5 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-accent-400"
          >
            <Mail className="h-4 w-4" aria-hidden />
            support@autoverifi.com
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Auto Verifi. All rights reserved.</p>
          <div className="flex items-center gap-5">
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
        <p className="mx-auto max-w-6xl px-4 pb-6 text-center text-[11px] leading-relaxed text-slate-600 sm:px-6 sm:text-left">
          Reports are informational only and are not a substitute for an
          official PPSR certificate or independent vehicle inspection.
        </p>
      </div>
    </footer>
  );
}
