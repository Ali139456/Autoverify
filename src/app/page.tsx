import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  ChevronDown,
  Brain,
  Camera,
  CarFront,
  FileText,
  History,
  Search,
  ShieldCheck,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { ComparisonTable } from "@/components/ComparisonTable";
import { RegoSearchForm } from "@/components/RegoSearchForm";
import { Reveal } from "@/components/Reveal";
import { formatPrice } from "@/lib/stripe";

const CHECKS = [
  { icon: History, title: "Full history checks", text: "PPSR encumbrance, finance owing, write-off and stolen vehicle records — everything that could void your purchase." },
  { icon: BadgeDollarSign, title: "Live market valuation", text: "Trade-in, private sale and dealer retail price ranges powered by real-time Autograb market data." },
  { icon: Brain, title: "AI future insights", text: "Predicted depreciation curve, 3-year residual value and an overall risk score — see the future, not just the past." },
  { icon: Camera, title: "AI photo damage scan", text: "Upload photos of the car and Ravin.ai detects dents, scratches and panel damage with repair cost estimates." },
  { icon: CarFront, title: "Market comparables", text: "See similar cars currently for sale, their prices, kilometres and how long they've been listed." },
  { icon: FileText, title: "Professional PDF report", text: "Everything compiled into a beautifully designed report you can download, save and share." },
];

const STEPS = [
  { n: "1", title: "Enter the rego", text: "Type in the registration plate and state of the car you're looking at." },
  { n: "2", title: "Preview the vehicle", text: "We instantly identify the car and show you a free summary so you know it's the right one." },
  { n: "3", title: "Pay securely", text: "One-off payment via Stripe — cards accepted, no subscription, no hidden fees." },
  { n: "4", title: "Get your report", text: "View the full report online instantly and download the PDF to keep." },
];

const FAQS = [
  {
    q: "What is a PPSR check?",
    a: "The Personal Property Securities Register (PPSR) records whether money is still owed on a car. If you buy a car with finance owing, the lender can repossess it — even from you. Every Auto Verifi report includes a PPSR-style encumbrance check.",
  },
  {
    q: "How is Auto Verifi different from other car history checks?",
    a: "Most car history websites only show you the past. Auto Verifi combines past records (write-offs, finance, theft), current market data (valuation and comparable listings) and AI-powered future insights (depreciation forecast, residual value and risk scoring) in a single report.",
  },
  {
    q: "How fast do I get my report?",
    a: "Instantly. As soon as your payment is confirmed, your report is generated and available online with a downloadable PDF.",
  },
  {
    q: "Which countries are supported?",
    a: "Auto Verifi currently supports Australian registrations across all states and territories. New Zealand, the United Kingdom and the United States are on our roadmap.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. Payments are processed by Stripe, a PCI-DSS Level 1 certified payment provider. We never see or store your card details.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section
        id="check"
        className="relative scroll-mt-24 overflow-hidden bg-ink-950"
      >
        {/* ambient glows */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-accent-600/15 blur-[140px]" />
        <div className="pointer-events-none absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-accent-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-14 lg:pb-24 lg:pt-20">
          <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12">
            {/* Copy */}
            <div className="min-w-0 text-center lg:text-left">
              <p className="animate-fade-up mb-4 inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-xs font-medium text-accent-300 sm:mb-5 sm:px-4 sm:py-1.5 sm:text-sm">
                <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
                Australia&apos;s smarter car history check
              </p>
              <h1 className="animate-fade-up delay-100 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Know what
                <br />
                you&apos;re buying.
              </h1>
              <p className="text-gradient-blue animate-fade-up delay-200 mt-3 text-2xl font-extrabold tracking-tight sm:mt-4 sm:text-3xl lg:text-4xl">
                Auto Verifi Intelligence
              </p>
              <p className="animate-fade-up delay-300 mx-auto mt-3 max-w-md text-base text-slate-400 sm:mt-4 sm:text-lg lg:mx-0">
                Past, Present and Future insights to buy with confidence — for{" "}
                <span className="font-semibold text-white">{formatPrice()}</span>.
              </p>
              <div className="animate-fade-up delay-400 mt-6 sm:mt-8">
                <RegoSearchForm />
                <p className="mt-3 text-xs text-slate-500 sm:text-sm">
                  Free vehicle preview — pay only when you want the full report.
                </p>
              </div>
            </div>

            {/* Vehicle visual */}
            <div className="animate-scale-in delay-200 relative mx-auto w-full min-w-0 max-w-[320px] sm:max-w-[420px] lg:max-w-[500px]">
              <div className="pointer-events-none absolute inset-8 rounded-full bg-accent-500/20 blur-[90px]" />
              {/* corner frame accents */}
              <span className="absolute left-0 top-0 z-10 h-7 w-7 rounded-tl-xl border-l-4 border-t-4 border-accent-500 sm:h-10 sm:w-10" />
              <span className="absolute right-0 top-0 z-10 h-7 w-7 rounded-tr-xl border-r-4 border-t-4 border-accent-500 sm:h-10 sm:w-10" />
              <span className="absolute bottom-0 left-0 z-10 h-7 w-7 rounded-bl-xl border-b-4 border-l-4 border-accent-500 sm:h-10 sm:w-10" />
              <span className="absolute bottom-0 right-0 z-10 h-7 w-7 rounded-br-xl border-b-4 border-r-4 border-accent-500 sm:h-10 sm:w-10" />
              <Image
                src="/hero-car.png"
                alt="Black SUV inside a glowing blue ring — Auto Verifi vehicle intelligence"
                width={820}
                height={820}
                priority
                sizes="(max-width: 640px) 320px, (max-width: 1024px) 420px, 500px"
                className="animate-float relative h-auto w-full rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-white/10 bg-ink-900">
        <div className="mx-auto grid max-w-6xl grid-cols-1 justify-items-center gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
          {[
            { icon: Search, text: "Instant vehicle identification from the plate" },
            { icon: Wallet, text: "Secure one-off payment with Stripe" },
            { icon: TrendingDown, text: "AI depreciation & risk forecasting" },
          ].map(({ icon: Icon, text }, i) => (
            <Reveal key={text} delay={i * 120} className="flex w-full max-w-xs items-center gap-3 text-slate-300">
              <span className="rounded-lg border border-accent-500/30 bg-accent-500/10 p-2">
                <Icon className="h-5 w-5 text-accent-400" aria-hidden />
              </span>
              <span className="text-sm font-medium">{text}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* What's included */}
      <section id="whats-included" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            What&apos;s in every <span className="text-accent-400">report</span>
          </h2>
          <p className="mt-3 text-sm text-slate-400 sm:text-base">
            Other checks stop at the past. We cover past, present and future.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {CHECKS.map(({ icon: Icon, title, text }, i) => (
            <Reveal
              key={title}
              delay={(i % 3) * 120}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-ink-900/40 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-500/40 sm:p-7"
            >
              {/* hover spotlight */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-500/0 blur-3xl transition-all duration-500 group-hover:bg-accent-500/15" />

              {/* big ghost index */}
              <span className="pointer-events-none absolute right-6 top-5 text-5xl font-black tracking-tight text-white/[0.05] transition-colors duration-300 group-hover:text-accent-500/15">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* gradient icon tile */}
              <span className="relative inline-flex rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 p-3.5 transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-6 w-6 text-white" aria-hidden />
              </span>

              <h3 className="relative mt-5 text-lg font-bold text-white transition-colors group-hover:text-accent-300">
                {title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-slate-400">
                {text}
              </p>

              {/* bottom accent line on hover */}
              <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section
        id="comparison"
        className="relative scroll-mt-24 overflow-hidden border-t border-white/10 bg-ink-900 py-12 sm:py-16 lg:py-20"
      >
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[350px] w-[750px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent-400">
              Comparison
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
              The Auto Verifi <span className="text-accent-400">Advantage</span>
            </h2>
            <p className="mt-3 text-sm text-slate-400 sm:text-base">
              See how Auto Verifi compares to PPSR and competitor reports
              across every category.
            </p>
          </Reveal>
          <Reveal delay={150} className="mt-8 sm:mt-12">
            <ComparisonTable />
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative scroll-mt-24 overflow-hidden border-y border-white/10 bg-ink-900 py-12 sm:py-16 lg:py-20">
        <div className="pointer-events-none absolute -bottom-52 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              How it <span className="text-accent-400">works</span>
            </h2>
            <p className="mt-3 text-sm text-slate-400 sm:text-base">
              From rego to full report in under two minutes.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal
                key={s.n}
                delay={i * 120}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-ink-950/60 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-500/40"
              >
                <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-accent-500/0 blur-3xl transition-all duration-500 group-hover:bg-accent-500/15" />
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 text-lg font-black text-white transition-transform duration-300 group-hover:scale-110">
                    {s.n}
                  </span>
                  {i < STEPS.length - 1 && (
                    <ArrowRight
                      className="h-5 w-5 text-slate-600 transition-colors group-hover:text-accent-400"
                      aria-hidden
                    />
                  )}
                </div>
                <h3 className="relative mt-5 font-bold text-white transition-colors group-hover:text-accent-300">
                  {s.title}
                </h3>
                <p className="relative mt-2 text-sm text-slate-400">{s.text}</p>
                <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Reveal>
            ))}
          </div>
          <Reveal delay={200} className="mt-8 text-center sm:mt-10">
            <Link
              href="/#check"
              className="inline-flex items-center gap-2 rounded-full bg-accent-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-500 sm:px-8 sm:py-3.5 sm:text-base"
            >
              Buy Report — {formatPrice()}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <Reveal>
          <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Frequently asked <span className="text-accent-400">questions</span>
          </h2>
        </Reveal>
        <div className="mt-8 space-y-3 sm:mt-10 sm:space-y-4">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 80}>
              <details className="group rounded-xl border border-white/10 bg-ink-800/60 p-4 transition open:border-accent-500/40 sm:p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-white marker:hidden sm:text-base [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 transition group-open:rotate-180 group-open:border-accent-500/50 group-open:bg-accent-500/15">
                    <ChevronDown className="h-4 w-4 text-accent-400" aria-hidden />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
