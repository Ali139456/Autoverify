"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { HomeCheckLink } from "@/components/HomeCheckLink";
import { Reveal } from "@/components/Reveal";
import { AI_DAMAGE_PROCESSING_MINUTES } from "@/lib/damage-processing-copy";
import { formatTierPrice } from "@/lib/pricing";

const STEPS = [
  {
    n: "1",
    title: "Enter rego or VIN",
    text: "Type in the registration plate and state, or the 17-digit VIN if the car isn't registered.",
  },
  {
    n: "2",
    title: "Preview the vehicle",
    text: "We instantly identify the car and show you a free summary so you know it's the right one.",
  },
  {
    n: "3",
    title: "Select your preferred report",
    text: "Choose Insights or Insights+. For Insights+, you and/or the vehicle owner will receive an SMS link to complete the AI powered condition assessment.",
  },
  {
    n: "4",
    title: "Pay securely",
    text: "One-off payment via Stripe — cards accepted, no subscription, no hidden fees.",
  },
  {
    n: "5",
    title: "Get your report",
    text: `View the full report online instantly and download the PDF to keep. For Insights+ condition assessment images, you'll receive these in under ${AI_DAMAGE_PROCESSING_MINUTES} minutes.`,
  },
] as const;

function stepCircleClass(index: number, activeStep: number): string {
  const base =
    "relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-500 sm:h-10 sm:w-10";
  if (index === activeStep) {
    return `${base} scale-110 bg-accent-500 text-white shadow-[0_0_24px_rgba(0,115,227,0.5)]`;
  }
  if (index < activeStep) {
    return `${base} border border-accent-500/50 bg-accent-500/20 text-white`;
  }
  return `${base} border border-white/25 bg-ink-950 text-white`;
}

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  const updateActiveStep = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const sectionTop = rect.top;
    const sectionHeight = rect.height;

    // Prefer each step’s position when the list is taller than the viewport
    const viewportAnchor = vh * 0.38;
    let closest = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    let hasStepRefs = false;

    stepRefs.current.forEach((el, index) => {
      if (!el) return;
      hasStepRefs = true;
      const stepRect = el.getBoundingClientRect();
      const stepCenter = stepRect.top + stepRect.height / 2;
      const distance = Math.abs(stepCenter - viewportAnchor);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });

    if (hasStepRefs && sectionHeight > vh * 0.85) {
      setActiveStep(closest);
      return;
    }

    // Shorter viewports: map scroll through the section to steps 1 → 5
    const scrollSpan = Math.max(sectionHeight - vh * 0.35, 1);
    const scrolled = Math.min(Math.max(-sectionTop + vh * 0.22, 0), scrollSpan);
    const ratio = scrolled / scrollSpan;
    const fromProgress = Math.round(ratio * (STEPS.length - 1));
    setActiveStep(fromProgress);
  }, []);

  useEffect(() => {
    updateActiveStep();
    window.addEventListener("scroll", updateActiveStep, { passive: true });
    window.addEventListener("resize", updateActiveStep);
    return () => {
      window.removeEventListener("scroll", updateActiveStep);
      window.removeEventListener("resize", updateActiveStep);
    };
  }, [updateActiveStep]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative scroll-mt-24 overflow-x-clip border-y border-white/10 bg-gradient-to-br from-ink-950 via-[#0a1028] to-ink-950 py-14 sm:py-16 lg:py-20"
    >
      <div className="pointer-events-none absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-accent-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 left-0 h-[320px] w-[320px] rounded-full bg-accent-500/10 blur-[90px]" />
      <div className="av-site-container relative">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_min(52%,480px)] lg:gap-x-10 lg:gap-y-8 xl:grid-cols-[minmax(0,1fr)_min(54%,540px)] xl:gap-x-12">
          <Reveal className="min-w-0 lg:col-start-1 lg:row-start-1">
            <span className="inline-flex rounded-full border border-accent-500/40 bg-accent-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-300">
              Stepper
            </span>
            <h2 className="mt-4 text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl">
              How it <span className="text-accent-400">works</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm text-slate-400 sm:text-base">
              From rego to full report in minutes.
            </p>
          </Reveal>

          <div className="min-w-0 lg:col-start-1 lg:row-start-2">
            <ol className="relative mt-10 list-none space-y-0 p-0 sm:mt-12 lg:mt-0">
              <div
                className="absolute bottom-6 left-[1.125rem] top-6 w-px bg-white/15 sm:left-[1.1875rem]"
                aria-hidden
              />
              {STEPS.map((s, i) => (
                <li
                  key={s.n}
                  ref={(el) => {
                    stepRefs.current[i] = el;
                  }}
                  className="relative flex gap-4 pb-10 last:pb-0 sm:gap-5 sm:pb-12"
                >
                  <span className={stepCircleClass(i, activeStep)}>{s.n}</span>
                  <div
                    className={`min-w-0 pt-0.5 transition-opacity duration-500 ${
                      i === activeStep ? "opacity-100" : "opacity-75"
                    }`}
                  >
                    <h3
                      className={`text-base font-bold sm:text-lg ${
                        i === activeStep ? "text-white" : "text-slate-200"
                      }`}
                    >
                      {s.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                      {s.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <Reveal delay={200} className="mt-8 sm:mt-10">
              <HomeCheckLink
                className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-600 sm:px-8 sm:py-3.5 sm:text-base"
              >
                Buy Report — from {formatTierPrice("insights")}
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
              </HomeCheckLink>
            </Reveal>
          </div>

          <div className="mt-10 flex justify-center lg:col-start-2 lg:row-start-2 lg:mt-0 lg:flex-col lg:items-end lg:justify-start lg:self-stretch">
            <div className="w-full max-w-[380px] sm:max-w-[420px] lg:sticky lg:top-24 lg:w-full lg:max-w-none">
              <div className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
                <Image
                  src="/how-it-works-inspection.png"
                  alt="Vehicle owner completing an AI powered condition assessment with their phone"
                  width={800}
                  height={1000}
                  sizes="(max-width: 640px) 380px, (max-width: 1024px) 420px, 540px"
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
