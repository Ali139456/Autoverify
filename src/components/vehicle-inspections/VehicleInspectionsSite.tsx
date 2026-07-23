import Image from "next/image";
import { ArrowRight, BadgeCheck } from "lucide-react";

const INTRO =
  "Auto Verifi delivers independent vehicle inspection, motor dealer assessment and expert witness services — combining decades of operational expertise with digital evidence capture and rigorous quality assurance.";

const HIGHLIGHTS = [
  "Independent, evidence-based assessments",
  "30+ years of automotive inspection expertise",
  "Digital evidence capture & secure reporting",
];

export function VehicleInspectionsSite() {
  return (
    <div className="-mt-[76px] bg-[#07111f] text-white sm:-mt-[80px]">
      {/* Hero — matches Base44 preview */}
      <section className="relative min-h-[620px] overflow-hidden pt-[76px] sm:min-h-[720px] sm:pt-[80px]">
        <Image
          src="/vehicle-inspections/hero-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07111f]/95 via-[#07111f]/85 to-[#0b1f3d]/55" />

        <div className="relative mx-auto flex min-h-[540px] max-w-6xl items-center px-4 py-16 sm:min-h-[620px] sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="block text-white">Independent special purpose</span>
              <span className="mt-1 block text-[#4da3ff]">
                Vehicle Inspection Services
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {INTRO}
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563eb]">
                <BadgeCheck className="h-4 w-4 text-white" aria-hidden />
              </span>
              Independent, evidence-based assessments
            </div>
          </div>
        </div>
      </section>

      {/* Services — matches Base44 preview */}
      <section
        id="services"
        className="relative scroll-mt-28 overflow-hidden sm:scroll-mt-32"
      >
        <Image
          src="/vehicle-inspections/services-bg.jpg"
          alt=""
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#07111f]/88" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-4xl font-extrabold tracking-tight text-[#4da3ff] sm:text-5xl">
            Services
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {INTRO}
          </p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-100">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563eb]">
                  <BadgeCheck className="h-4 w-4 text-white" aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#services"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1d4ed8]"
            >
              Explore services
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-xl border border-[#2563eb] px-6 py-3.5 text-sm font-bold text-[#93c5fd] transition hover:bg-[#2563eb]/10"
            >
              Request an inspection
            </a>
          </div>
        </div>
      </section>

      {/* Contact us — anchor for Base44 CTA */}
      <section
        id="contact"
        className="scroll-mt-28 border-t border-white/10 bg-[#081423] sm:scroll-mt-32"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Contact us
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300">
            Request an inspection or tender capability information. Email us at{" "}
            <a
              href="mailto:support@autoverifi.com.au?subject=Vehicle%20Inspection%20Request"
              className="font-semibold text-[#93c5fd] hover:text-white"
            >
              support@autoverifi.com.au
            </a>
            .
          </p>
          <a
            href="mailto:support@autoverifi.com.au?subject=Vehicle%20Inspection%20Request"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1d4ed8]"
          >
            Request an inspection
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </section>
    </div>
  );
}
