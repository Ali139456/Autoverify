"use client";

import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Car,
  Gavel,
  Mail,
  TrendingUp,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";

const INTRO =
  "Auto Verifi delivers independent vehicle inspection, motor dealer assessment and expert witness services — combining decades of operational expertise with digital evidence capture and rigorous quality assurance.";

const HIGHLIGHTS = [
  "Independent, evidence-based assessments",
  "30+ years of automotive inspection expertise",
  "Digital evidence capture & secure reporting",
];

const DEALER_BULLETS = [
  "Pre-sale and post-sale vehicle condition inspections",
  "Defect identification and severity assessment",
  "Photographic evidence capture and structured reporting",
  "Compliance assessment against applicable standards",
  "Metropolitan and regional NSW coverage",
];

const EXPERT_BULLETS = [
  "Independent expert reports for legal proceedings",
  "Vehicle condition and mechanical failure analysis",
  "Assessment of dealer conduct and disclosure obligations",
  "Valuation and loss-of-value opinions",
  "Court-ready, evidence-based documentation",
];

const THEO_EXPERTISE = [
  "Vehicle inspection operations at national scale",
  "Quality assurance, contractor oversight & operational governance",
  "Motor dealer assessment and regulatory compliance",
  "Independent, evidence-based technical reporting",
  "Litigation support and expert technical opinion",
];

const DENISE_EXPERTISE = [
  "Finance & investment management (23+ years)",
  "Business scaling, M&A and ASX exit execution",
  "Financial management & profit optimisation",
  "Governance, risk and compliance frameworks",
  "Strategy, valuation and fractional executive support",
];

const DENISE_BADGES = [
  "Co-Founder, Auto Ventures",
  "Co-Founder, Hazard Inspect",
  "Founder, Activator Business Advisors",
];

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-2.5">
      {items.map((item, i) => (
        <Reveal key={item} delay={i * 60}>
          <li className="flex items-start gap-2.5 text-sm text-slate-300">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4da3ff]" />
            {item}
          </li>
        </Reveal>
      ))}
    </ul>
  );
}

function ExpertiseCards({ items }: { items: string[] }) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {items.map((item, i) => (
        <Reveal key={item} delay={i * 70}>
          <div className="vi-card-hover rounded-2xl border border-white/5 bg-[#0a1240]/80 px-4 py-3.5 text-sm text-slate-200 backdrop-blur-sm">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#4da3ff]" />
            {item}
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function VehicleInspectionsSite() {
  return (
    <div className="-mt-[76px] overflow-x-hidden bg-[#010626] text-white sm:-mt-[80px]">
      {/* 1. Hero */}
      <section className="relative min-h-[680px] overflow-hidden pt-[76px] sm:min-h-[760px] sm:pt-[80px]">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/bcc6e275a_image.png"
            alt=""
            fill
            priority
            className="vi-hero-image object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#010626]/95 via-[#010626]/88 to-[#0b1f3d]/55" />
        <div className="pointer-events-none absolute -left-32 top-24 h-[420px] w-[420px] rounded-full bg-[#2563eb]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-[360px] w-[360px] rounded-full bg-[#4da3ff]/10 blur-[100px]" />

        <div className="relative mx-auto flex min-h-[580px] max-w-6xl items-center px-4 py-16 sm:min-h-[660px] sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="animate-fade-up text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="block text-white">Independent special purpose</span>
              <span className="mt-1 block bg-gradient-to-r from-[#4da3ff] via-[#93c5fd] to-[#2563eb] bg-clip-text text-transparent">
                Vehicle Inspection Services
              </span>
            </h1>
            <p className="animate-fade-up delay-100 mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {INTRO}
            </p>

            <ul className="animate-fade-up delay-200 mt-8 space-y-3">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-100">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563eb] shadow-[0_0_20px_rgba(37,99,235,0.45)]">
                    <BadgeCheck className="h-4 w-4 text-white" aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="animate-fade-up delay-300 mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#services"
                className="btn-shine group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition hover:from-[#1d4ed8] hover:to-[#2563eb]"
              >
                Explore services
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-xl border border-[#2563eb]/70 bg-white/[0.03] px-6 py-3.5 text-sm font-bold text-[#93c5fd] backdrop-blur-sm transition hover:border-[#4da3ff] hover:bg-[#2563eb]/10 hover:text-white"
              >
                Request an inspection
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Services */}
      <section
        id="services"
        className="relative scroll-mt-28 bg-[#010626] px-4 py-16 sm:scroll-mt-32 sm:px-6 sm:py-24"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4da3ff]/30 to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-20 h-[280px] w-[560px] -translate-x-1/2 rounded-full bg-[#2563eb]/10 blur-[100px]" />

        <Reveal className="relative mx-auto max-w-6xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4da3ff]">
            What we do
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Services built around independence
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-400 sm:text-lg">
            Two connected practice areas, each grounded in objective,
            evidence-based assessment and decades of operational inspection
            expertise.
          </p>
        </Reveal>

        <div className="relative mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-2">
          <Reveal delay={80}>
            <article className="vi-card-hover h-full rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a1240] to-[#07102a] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#2563eb]/20 text-[#93c5fd] ring-1 ring-[#4da3ff]/20">
                <Car className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-2xl font-bold text-white">Dealer Inspections</h3>
              <p className="mt-2 text-sm font-medium text-[#4da3ff]">
                Independent motor dealer assessment &amp; reporting
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Independent inspection and assessment of vehicles for motor
                dealers, regulatory bodies and consumers. Auto Verifi provides
                objective, evidence-based reporting on vehicle condition,
                compliance and defects — supporting regulatory decision-making and
                consumer protection.
              </p>
              <BulletList items={DEALER_BULLETS} />
            </article>
          </Reveal>

          <Reveal delay={160}>
            <article className="vi-card-hover h-full rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a1240] to-[#07102a] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-8">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#2563eb]/20 text-[#93c5fd] ring-1 ring-[#4da3ff]/20">
                <Gavel className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-2xl font-bold text-white">Expert Witness</h3>
              <p className="mt-2 text-sm font-medium text-[#4da3ff]">
                Litigation support &amp; technical opinion
              </p>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Independent expert technical opinion and litigation support for
                disputes involving vehicle condition, mechanical failure, dealer
                conduct and valuation. Reports are prepared to be defensible,
                objective and clearly reasoned for use in legal proceedings.
              </p>
              <BulletList items={EXPERT_BULLETS} />
            </article>
          </Reveal>
        </div>
      </section>

      {/* 3. Co-founders */}
      <section
        id="cofounders"
        className="relative scroll-mt-28 border-t border-white/5 bg-[#010626] px-4 py-16 sm:scroll-mt-32 sm:px-6 sm:py-24"
      >
        <Reveal className="mx-auto mb-12 max-w-6xl text-center sm:mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#4da3ff]">
            Leadership
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Co-founders
          </h2>
        </Reveal>

        <div className="mx-auto max-w-6xl space-y-16 sm:space-y-24">
          <Reveal>
            <div className="grid items-center gap-10 lg:grid-cols-[280px_1fr]">
              <div className="mx-auto lg:mx-0">
                <div className="vi-portrait-ring relative h-56 w-56 overflow-hidden rounded-full border-4 border-white/10 sm:h-64 sm:w-64">
                  <Image
                    src="/67a7dccc6e9273798fd70280-HeadshotPro-1.webp"
                    alt="Theo Cosmetatos"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#4da3ff]">
                  <Briefcase className="h-4 w-4" aria-hidden />
                  Co-founder, Auto Verifi
                </p>
                <h3 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                  Theo Cosmetatos
                </h3>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300">
                  With over 30 years of specialist experience in the automotive
                  industry, Theo co-founded Auto Inspect in 2007 and grew it into
                  Australia&apos;s leading independent vehicle inspections provider
                  — delivering more than one million vehicle inspections
                  nationally.
                </p>
                <ExpertiseCards items={THEO_EXPERTISE} />
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid items-start gap-10 lg:grid-cols-[1fr_280px]">
              <div className="order-2 lg:order-1">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#4da3ff]">
                  <TrendingUp className="h-4 w-4" aria-hidden />
                  Co-founder, Auto Verifi
                </p>
                <h3 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                  Denise Cosmetatos
                </h3>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300">
                  Denise brings 23+ years of experience in finance and investment
                  management across leading global organisations. As a co-founder
                  and CEO she scaled a business to the BRW Fast 100 Top 10 and
                  executed a successful sale to an ASX-listed company — grounding
                  Auto Verifi&apos;s commercial, governance and growth strategy in
                  real-world achievement.
                </p>
                <ExpertiseCards items={DENISE_EXPERTISE} />
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" aria-hidden />
                  {DENISE_BADGES.map((badge) => (
                    <span
                      key={badge}
                      className="rounded-full border border-[#2563eb]/40 bg-[#2563eb]/10 px-3 py-1 text-xs font-medium text-[#93c5fd] transition hover:border-[#4da3ff]/50 hover:bg-[#2563eb]/20"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
              <div className="order-1 mx-auto lg:order-2 lg:mx-0">
                <div className="vi-portrait-ring relative h-56 w-56 overflow-hidden rounded-full border-4 border-white/10 sm:h-64 sm:w-64">
                  <Image
                    src="/Linkedin-Headshot_DC.webp"
                    alt="Denise Cosmetatos"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 4. CTA */}
      <section
        id="contact"
        className="relative scroll-mt-28 px-4 py-16 sm:scroll-mt-32 sm:px-6 sm:py-24"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4da3ff]/25 to-transparent" />
        <Reveal>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a1240] via-[#08102b] to-[#0a1240] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#2563eb]/20 blur-[80px]" />
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  Request an inspection or consultation
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-300">
                  Whether you need an independent dealer inspection, expert witness
                  reporting or an audit of your inspection operations — our team is
                  ready to assist across metropolitan and regional New South Wales.
                </p>
                <a
                  href="mailto:info@autoverifi.com.au"
                  className="mt-6 inline-flex items-center gap-2 text-[#93c5fd] transition hover:text-white"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  info@autoverifi.com.au
                </a>
              </div>

              <form
                className="rounded-2xl border border-white/10 bg-[#010626]/70 p-5 backdrop-blur-md sm:p-6"
                action="mailto:info@autoverifi.com.au"
                method="post"
                encType="text/plain"
              >
                <label className="block text-sm">
                  <span className="mb-1.5 block text-slate-300">Name</span>
                  <input
                    name="name"
                    required
                    placeholder="Name"
                    className="w-full rounded-xl border border-white/10 bg-[#010626] px-4 py-3 text-white outline-none transition focus:border-[#4da3ff]/50 focus:ring-2 focus:ring-[#2563eb]/40 placeholder:text-slate-500"
                  />
                </label>
                <label className="mt-4 block text-sm">
                  <span className="mb-1.5 block text-slate-300">Email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Email"
                    className="w-full rounded-xl border border-white/10 bg-[#010626] px-4 py-3 text-white outline-none transition focus:border-[#4da3ff]/50 focus:ring-2 focus:ring-[#2563eb]/40 placeholder:text-slate-500"
                  />
                </label>
                <label className="mt-4 block text-sm">
                  <span className="mb-1.5 block text-slate-300">Service required</span>
                  <select
                    name="service"
                    defaultValue="Dealer Inspection"
                    className="w-full rounded-xl border border-white/10 bg-[#010626] px-4 py-3 text-white outline-none transition focus:border-[#4da3ff]/50 focus:ring-2 focus:ring-[#2563eb]/40"
                  >
                    <option>Dealer Inspection</option>
                    <option>Expert Witness</option>
                    <option>Inspection operations audit</option>
                  </select>
                </label>
                <button
                  type="submit"
                  className="btn-shine group mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(37,99,235,0.35)] transition hover:from-[#1d4ed8] hover:to-[#2563eb] sm:w-auto"
                >
                  Submit request
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </button>
              </form>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 5. Footer */}
      <footer className="border-t border-white/10 bg-[#010626] px-4 py-8 sm:px-6">
        <Reveal>
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <Logo height={36} linked={false} />
            <div className="text-left text-sm leading-relaxed text-slate-400 sm:text-right">
              <p>
                Location: Level 35, Tower One - International Towers, 100
                Barangaroo Avenue, Sydney, 2000, NSW, Australia
              </p>
              <p className="mt-1">
                e:{" "}
                <a
                  href="mailto:info@autoverifi.com.au"
                  className="text-[#4da3ff] transition hover:text-white"
                >
                  info@autoverifi.com.au
                </a>
              </p>
            </div>
          </div>
        </Reveal>
      </footer>
    </div>
  );
}
