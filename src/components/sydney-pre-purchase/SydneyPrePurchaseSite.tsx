"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bike,
  Car,
  Check,
  Truck,
  Zap,
} from "lucide-react";
import {
  PPI_FAQ,
  PPI_HOW_IT_WORKS,
  PPI_INSPECTION_GROUPS,
  PPI_VEHICLE_TYPES,
  SYDNEY_INSPECTION_AREAS,
} from "@/lib/pre-purchase/sydney-landing-content";
import { PPI_SAMPLE_REPORT_HREF } from "@/lib/pre-purchase/sample-report";
import { SYDNEY_PPI_SERVICES } from "@/lib/pre-purchase/sydney-ppi-services";
import {
  SYDNEY_PPI_BOOK_HREF,
  SYDNEY_PPI_WHAT_WE_CHECK_HREF,
  sydneyPpiServiceHref,
} from "@/lib/pre-purchase/sydney-ppi-paths";
import {
  PAGE_CONTAINER,
  SydneyPpiFooter,
  SydneyPpiHeader,
  scrollToSection,
} from "./sydney-ppi-chrome";
import { SydneyPpiPage, SydneyPpiSection } from "./sydney-ppi-layout";

const HERO_IMAGE = "/vehicle-inspections/pre-purchase-hero.png";

const SLUG_BY_CATEGORY = Object.fromEntries(
  SYDNEY_PPI_SERVICES.map((s) => [s.categoryId, s.slug]),
) as Record<string, string>;

const VEHICLE_ICONS = {
  passenger: Car,
  commercial: Truck,
  ev: Zap,
  caravan: Truck,
  motorcycle: Bike,
} as const;

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="scroll-mt-24 w-full min-w-0 border-t border-white/10 py-16 sm:py-20"
    >
      <div className={PAGE_CONTAINER}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
          Common questions
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.5rem]">
          Answers before you book
        </h2>
        <ul className="mt-10 w-full divide-y divide-white/10">
          {PPI_FAQ.map((item, index) => {
            const open = openIndex === index;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left sm:py-6"
                >
                  <span className="text-base font-semibold text-white sm:text-lg">
                    {item.q}
                  </span>
                  <span
                    className="text-xl font-light text-accent-400"
                    aria-hidden
                  >
                    {open ? "×" : "+"}
                  </span>
                </button>
                {open ? (
                  <p className="max-w-4xl pb-5 text-sm leading-relaxed text-slate-400 sm:pb-6 sm:text-base">
                    {item.a}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function SydneyPrePurchaseSite() {
  return (
    <SydneyPpiPage>
      <SydneyPpiHeader />

      <SydneyPpiSection
        innerClassName="grid gap-10 py-12 sm:gap-12 sm:py-16 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,1.08fr)] lg:items-center lg:gap-x-12 lg:py-20 xl:gap-x-16 xl:py-24"
      >
        <div className="min-w-0 lg:max-w-[38rem]">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-400 sm:text-xs sm:tracking-[0.2em]">
            Pre-purchase inspections · Sydney wide
          </p>
          <h1 className="mt-5 text-[1.65rem] font-extrabold leading-[1.12] tracking-tight text-pretty text-white sm:mt-6 sm:text-[1.85rem] md:text-[2rem] lg:text-[2.65rem] lg:leading-[1.08] xl:text-[3rem]">
            Buy with confidence with a comprehensive mobile{" "}
            <span className="whitespace-nowrap">pre-purchase</span> inspection
          </h1>
          <p className="mt-6 max-w-[36rem] text-base leading-[1.65] text-slate-400 sm:text-lg sm:leading-relaxed">
            A qualified inspector travels to the vehicle, completes an identity
            verification, mechanical, body and interior inspection, then sends
            you a photo-backed digital report the same day.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 sm:mt-10">
            <Link
              href={SYDNEY_PPI_BOOK_HREF}
              className="inline-flex h-12 items-center gap-2.5 rounded-full bg-accent-500 px-7 text-base font-bold text-white transition hover:bg-accent-600"
            >
              Book inspection
              <ArrowRight className="h-[1.125rem] w-[1.125rem]" aria-hidden />
            </Link>
            <Link
              href={SYDNEY_PPI_WHAT_WE_CHECK_HREF}
              className="inline-flex h-12 items-center rounded-full border border-white/35 px-7 text-base font-semibold text-white transition hover:border-white/60"
            >
              See what we check
            </Link>
          </div>
        </div>
        <figure className="relative aspect-[4/3] w-full min-h-[240px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50 sm:rounded-3xl lg:aspect-auto lg:min-h-[min(34rem,52vh)] lg:max-h-[34rem]">
          <Image
            src={HERO_IMAGE}
            alt="Auto Verifi inspector at vehicle"
            fill
            className="object-cover object-[42%_45%] brightness-[1.06] contrast-[1.03]"
            sizes="(max-width: 1024px) 100vw, 54vw"
            priority
          />
        </figure>
      </SydneyPpiSection>

      <SydneyPpiSection
        id="what-we-check"
        className="scroll-mt-24 border-t border-white/10 bg-[#03060c]"
        innerClassName="py-16 sm:py-20"
      >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
            What we inspect
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PPI_VEHICLE_TYPES.map((card) => {
              const Icon = VEHICLE_ICONS[card.id];
              const slug = SLUG_BY_CATEGORY[card.id];
              const href = slug
                ? sydneyPpiServiceHref(slug)
                : SYDNEY_PPI_BOOK_HREF;
              return (
                <Link
                  key={card.id}
                  href={href}
                  className="group relative block rounded-2xl border border-white/10 bg-[#0c1528] p-5 transition hover:border-white/25"
                >
                  <ArrowUpRight
                    className="absolute right-4 top-4 h-4 w-4 text-slate-500 transition group-hover:text-accent-400"
                    aria-hidden
                  />
                  <div className="mb-4 inline-flex rounded-lg border border-white/10 bg-white/5 p-2">
                    <Icon className="h-5 w-5 text-white" aria-hidden />
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-accent-400">
                    {card.eyebrow}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">{card.description}</p>
                  <p className="mt-4 text-sm font-bold text-white">
                    ${card.price} incl. GST
                  </p>
                </Link>
              );
            })}
          </div>

          <h2 className="mt-16 text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
            The 100+ point inspection
          </h2>
          <p className="mt-3 max-w-2xl text-2xl font-bold text-white sm:text-3xl lg:text-[2rem]">
            What a pre-purchase inspection actually covers
          </p>
          <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
            Each group below is checked, graded and photographed on site.
            Anything that needs attention is listed in the report with a
            severity rating and repair guidance.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PPI_INSPECTION_GROUPS.map((group) => (
              <div
                key={group.title}
                className="rounded-2xl border border-white/10 bg-[#0a1220] p-4"
              >
                <h4 className="text-sm font-bold text-white">{group.title}</h4>
                <ul className="mt-3 space-y-2">
                  {group.items.map((line) => (
                    <li
                      key={line}
                      className="flex gap-2 text-xs leading-snug text-slate-400"
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-400"
                        aria-hidden
                      />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["100+", "Points checked on every vehicle"],
              ["Same day", "Photo-backed report delivered"],
              ["Onsite", "We travel to the vehicle"],
              ["Independent", "We work for you, not the seller"],
            ].map(([title, body]) => (
              <div
                key={title}
                className="rounded-xl border border-white/10 bg-[#0c1528] px-4 py-5"
              >
                <p className="text-xl font-extrabold text-white">{title}</p>
                <p className="mt-1 text-sm text-slate-400">{body}</p>
              </div>
            ))}
          </div>
      </SydneyPpiSection>

      <SydneyPpiSection
        id="how-it-works"
        className="scroll-mt-24 border-t border-white/10"
        innerClassName="py-16 sm:py-20"
      >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl lg:text-[2.5rem]">
            Booked today, reported today
          </h2>
          <p className="mt-3 max-w-2xl text-slate-400 sm:text-lg">
            No workshop drop-off, no waiting for the seller to make time. We
            handle the logistics and you get the facts.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PPI_HOW_IT_WORKS.map((step) => (
              <article
                key={step.step}
                className="rounded-2xl border border-white/10 bg-[#0c1528] p-5"
              >
                <p className="text-sm font-bold text-accent-400">{step.step}</p>
                <h3 className="mt-3 text-base font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400">{step.body}</p>
              </article>
            ))}
          </div>
      </SydneyPpiSection>

      <SydneyPpiSection
        id="about-report"
        className="scroll-mt-24 border-t border-white/10 bg-[#03060c]"
        innerClassName="py-16 sm:py-20"
      >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
            The deliverable
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold text-white sm:text-4xl lg:text-[2.5rem]">
            A report you can act on, not a list of jargon
          </h2>
          <p className="mt-4 max-w-2xl text-slate-400 sm:text-lg">
            Everything found on site becomes a graded finding with a photograph.
            You can forward it to the seller, take it to a mechanic, or use it to
            walk away.
          </p>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {[
              "Every item is rated Good (green), Fair (orange) or Repair or investigation needed (red).",
              "Faults are photographed and labelled, so nothing is a matter of opinion.",
              "Confirms defects, repairs required or items for further investigation — use findings to negotiate or walk away.",
            ].map((text) => (
              <div
                key={text.slice(0, 24)}
                className="rounded-2xl border border-white/10 bg-[#0c1528] p-5 text-sm text-slate-300 lg:last:col-span-2"
              >
                {text}
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={SYDNEY_PPI_BOOK_HREF}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-accent-500 px-6 text-sm font-bold text-white"
            >
              Book inspection
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href={PPI_SAMPLE_REPORT_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-6 text-sm font-semibold text-white"
            >
              Download sample report (PDF)
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 sm:ml-4">
              <span>
                <span className="text-emerald-400">●</span> Good
              </span>
              <span>
                <span className="text-amber-400">●</span> Fair
              </span>
              <span>
                <span className="text-red-400">●</span> Repair or investigation
                needed
              </span>
            </div>
          </div>
      </SydneyPpiSection>

      <FaqSection />

      <SydneyPpiSection
        className="border-t border-white/10"
        innerClassName="py-16 sm:py-20"
      >
          <div className="w-full rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1528] to-[#060a14] p-8 sm:p-10 lg:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
              Ready when you are
            </p>
            <h2 className="mt-3 max-w-4xl text-2xl font-extrabold text-white sm:text-3xl lg:text-[2.5rem] lg:leading-tight">
              Confirm the details and location of the car you are buying and we
              will do the rest
            </h2>
            <p className="mt-4 max-w-3xl text-base text-slate-400 sm:text-lg">
              Tell us the vehicle and the suburb and we will confirm a fixed
              price and the next available inspection time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={SYDNEY_PPI_BOOK_HREF}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-accent-500 px-7 text-base font-bold text-white"
              >
                Book inspection
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => scrollToSection("faq")}
                className="inline-flex h-12 items-center rounded-full border border-white/30 px-7 text-base font-semibold text-white"
              >
                Read the FAQs
              </button>
            </div>
          </div>

          <p className="mt-12 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Inspection areas
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {SYDNEY_INSPECTION_AREAS.map((area) => (
              <span
                key={area}
                className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-slate-300"
              >
                {area}
              </span>
            ))}
          </div>
      </SydneyPpiSection>

      <SydneyPpiFooter />
    </SydneyPpiPage>
  );
}