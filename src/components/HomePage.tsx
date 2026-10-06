import Image from "next/image";
import {
  ArrowRight,
  BadgeDollarSign,
  ChevronDown,
  Camera,
  CarFront,
  FileText,
  History,
  TrendingUp,
} from "lucide-react";
import { AboutUsSection } from "@/components/AboutUsSection";
import { HomeCheckLink } from "@/components/HomeCheckLink";
import { PricingTierCards } from "@/components/PricingTierCards";
import { HeroCheckLead } from "@/components/HeroCheckLead";
import { ScrollToCheckOnHash } from "@/components/ScrollToCheckOnHash";
import { Reveal } from "@/components/Reveal";
import { formatTierPrice } from "@/lib/pricing";

const INSIGHT_PILLARS = [
  {
    id: "past",
    items: [
      {
        icon: History,
        title: "Full history checks",
        text: "PPSR encumbrance, finance owing, write-off and stolen vehicle records.",
      },
      {
        icon: FileText,
        title: "Recall & registration data",
        text: "Safety recall signals and registration status from official register sources.",
      },
    ],
  },
  {
    id: "present",
    items: [
      {
        icon: BadgeDollarSign,
        title: "Market valuation",
        text: "Trade-in and retail valuation powered by live market data.",
      },
      {
        icon: CarFront,
        title: "Market comparables",
        text: "Similar cars for sale — price, kilometres and time on market.",
      },
    ],
  },
  {
    id: "future",
    items: [
      {
        icon: TrendingUp,
        title: "Future value forecast",
        text: "Predicted valuation at 1, 3 and 5 years based on market models (Insights+).",
      },
      {
        icon: Camera,
        title: "AI powered condition scan",
        text: "Guided photos to assess exterior, tyres and interior (Insights+).",
      },
    ],
  },
] as const;

const STEPS = [
  { n: "1", title: "Enter rego or VIN", text: "Type in the registration plate and state, or the 17-digit VIN if the car isn't registered." },
  { n: "2", title: "Preview the vehicle", text: "We instantly identify the car and show you a free summary so you know it's the right one." },
  { n: "3", title: "Pay securely", text: "One-off payment via Stripe — cards accepted, no subscription, no hidden fees." },
  { n: "4", title: "Get your report", text: "View the full report online instantly and download the PDF to keep." },
];

type FaqItem = {
  q: string;
  intro?: string;
  bullets?: string[];
  a?: string;
};

const FAQS: FaqItem[] = [
  {
    q: "What is a PPSR check?",
    intro:
      "PPSR stands for Personal Property Securities Register. For vehicles in Australia, a PPSR search is used when buying a used vehicle to check whether:",
    bullets: [
      "Money is owing on the vehicle — e.g. a lender has a registered security interest.",
      "The vehicle has been reported stolen.",
      "The vehicle has been recorded as a written-off vehicle.",
      "Key vehicle identity information, such as the VIN, matches the search.",
    ],
  },
  {
    q: "How is Auto Verifi different from other car history checks?",
    a: "Most car history websites only show you the past. Auto Verifi combines past records (write-offs, finance, theft), current market data (valuation and comparable listings), future value insights and AI-powered condition assessment to provide a blend of past, present and future vehicle intelligence.",
  },
  {
    q: "How fast do I get my report?",
    a: "Instantly. As soon as your payment is confirmed, your report is generated and available online with a downloadable PDF.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes. Payments are processed by Stripe, a PCI-DSS Level 1 certified payment provider. We never see or store your card details.",
  },
];

const featureCardClass =
  "group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-500/40 sm:p-7 dark:border-white/10 dark:bg-ink-800 dark:shadow-none";

const stepCardClass =
  "group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-500/40 dark:border-white/10 dark:bg-ink-800 dark:shadow-none";

export function HomePage() {
  return (
    <>
      <section
        id="check"
        className="relative scroll-mt-24 overflow-x-clip bg-ink-950"
      >
        <ScrollToCheckOnHash />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-accent-500/15 blur-[140px]" />

        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-14 lg:pb-12 lg:pt-20">
          <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12">
            <HeroCheckLead />

            <div className="animate-scale-in delay-200 relative mx-auto w-full min-w-0 max-w-[320px] sm:max-w-[420px] lg:max-w-[500px]">
              <div className="pointer-events-none absolute inset-8 rounded-full bg-accent-500/25 blur-[90px]" />
              <span className="absolute left-0 top-0 z-10 h-7 w-7 rounded-tl-xl border-l-4 border-t-4 border-accent-500 sm:h-10 sm:w-10" />
              <span className="absolute right-0 top-0 z-10 h-7 w-7 rounded-tr-xl border-r-4 border-t-4 border-accent-500 sm:h-10 sm:w-10" />
              <span className="absolute bottom-0 left-0 z-10 h-7 w-7 rounded-bl-xl border-b-4 border-l-4 border-accent-500 sm:h-10 sm:w-10" />
              <span className="absolute bottom-0 right-0 z-10 h-7 w-7 rounded-br-xl border-b-4 border-r-4 border-accent-500 sm:h-10 sm:w-10" />
              <div className="relative overflow-hidden rounded-2xl bg-ink-950">
                <Image
                  src="/hero-car-white.png"
                  alt="White SUV inside a glowing blue ring — Auto Verifi vehicle intelligence"
                  width={820}
                  height={820}
                  priority
                  sizes="(max-width: 640px) 320px, (max-width: 1024px) 420px, 500px"
                  className="animate-float relative h-auto w-full mix-blend-screen"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="whats-included" className="relative scroll-mt-24 bg-white px-4 pb-12 pt-6 dark:bg-ink-950 sm:px-6 sm:pb-14 sm:pt-8 lg:pb-16 lg:pt-10">
        <div className="relative mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Report <span className="text-accent-500">Features</span>
            </h2>
          </Reveal>
          <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            {INSIGHT_PILLARS.map((pillar, pillarIndex) => (
              <Reveal key={pillar.id} delay={pillarIndex * 120} className="space-y-4">
                <ul className="space-y-4">
                  {pillar.items.map(({ icon: Icon, title, text }) => (
                    <li
                      key={title}
                      className={`${featureCardClass} !p-5 sm:!p-6`}
                    >
                      <span className="relative inline-flex rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 p-3 transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-5 w-5 text-white" aria-hidden />
                      </span>
                      <h4 className="relative mt-4 text-base font-bold text-slate-900 dark:text-white">
                        {title}
                      </h4>
                      <p className="relative mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {text}
                      </p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="comparison"
        className="relative scroll-mt-24 overflow-x-clip border-t border-slate-200 bg-white py-12 dark:border-white/10 dark:bg-ink-950 sm:py-16 lg:py-20"
      >
        <div className="relative mx-auto w-full min-w-0 max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
              The Auto Verifi <span className="text-accent-500">Advantage</span>
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
              Market leading insights where{" "}
              <span className="font-semibold text-accent-500">
                Data, AI and Human intelligence
              </span>{" "}
              meet
            </p>
          </Reveal>
          <Reveal delay={150} className="mt-8 sm:mt-12">
            <PricingTierCards showHeading={false} />
          </Reveal>
        </div>
      </section>

      <section
        id="how-it-works"
        className="relative scroll-mt-24 overflow-hidden border-y border-slate-200 bg-slate-50 py-12 dark:border-white/10 dark:bg-ink-900 sm:py-16 lg:py-20"
      >
        <div className="pointer-events-none absolute -bottom-52 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-accent-600/10 blur-[120px]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              How it <span className="text-accent-400">works</span>
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
              From rego to full report in minutes.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 120} className={stepCardClass}>
                <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-accent-500/0 blur-3xl transition-all duration-500 group-hover:bg-accent-500/15" />
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-700 text-lg font-black text-white transition-transform duration-300 group-hover:scale-110">
                    {s.n}
                  </span>
                  {i < STEPS.length - 1 && (
                    <ArrowRight
                      className="h-5 w-5 text-slate-400 transition-colors group-hover:text-accent-500 dark:text-slate-600 dark:group-hover:text-accent-400"
                      aria-hidden
                    />
                  )}
                </div>
                <h3 className="relative mt-5 font-bold text-slate-900 transition-colors group-hover:text-accent-600 dark:text-white dark:group-hover:text-accent-300">
                  {s.title}
                </h3>
                <p className="relative mt-2 text-sm text-slate-600 dark:text-slate-400">{s.text}</p>
                <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Reveal>
            ))}
          </div>
          <Reveal delay={200} className="mt-8 text-center sm:mt-10">
            <HomeCheckLink
              className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-600 sm:px-8 sm:py-3.5 sm:text-base"
            >
              Buy Report — from {formatTierPrice("insights")}
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
            </HomeCheckLink>
          </Reveal>
        </div>
      </section>

      <AboutUsSection />

      <section id="faq" className="scroll-mt-24 bg-white px-4 py-12 dark:bg-ink-950 sm:px-6 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Frequently asked <span className="text-accent-400">questions</span>
            </h2>
          </Reveal>
          <div className="mt-8 space-y-3 sm:mt-10 sm:space-y-4">
            {FAQS.map((f, i) => (
              <Reveal key={f.q} delay={i * 80}>
                <details className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition open:border-accent-500/40 sm:p-5 dark:border-white/10 dark:bg-ink-800">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900 marker:hidden dark:text-white sm:text-base [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white transition group-open:rotate-180 group-open:border-accent-500/50 group-open:bg-accent-50 dark:border-white/10 dark:bg-white/5 dark:group-open:bg-accent-500/15">
                      <ChevronDown className="h-4 w-4 text-accent-500 dark:text-accent-400" aria-hidden />
                    </span>
                  </summary>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {f.intro ? <p>{f.intro}</p> : null}
                    {f.bullets ? (
                      <ul className="list-disc space-y-2 pl-5">
                        {f.bullets.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                    {f.a ? <p>{f.a}</p> : null}
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
