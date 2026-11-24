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
  Menu,
  Phone,
  Truck,
  X,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { PrePurchaseBookingForm } from "@/components/pre-purchase/PrePurchaseBookingForm";
import { AUTOVERIFI_CONTACT_EMAIL } from "@/lib/site-contact";
import {
  PPI_FAQ,
  PPI_HOW_IT_WORKS,
  PPI_INSPECTION_GROUPS,
  PPI_VEHICLE_TYPES,
  SYDNEY_INSPECTION_AREAS,
  SYDNEY_PPI_PHONE,
  SYDNEY_PPI_PHONE_HREF,
} from "@/lib/pre-purchase/sydney-landing-content";

const HERO_IMAGE = "/vehicle-inspections/pre-purchase-hero.jpg";

const VEHICLE_ICONS = {
  passenger: Car,
  commercial: Truck,
  ev: Zap,
  caravan: Truck,
  motorcycle: Bike,
} as const;

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function SydneyHeader() {
  const [open, setOpen] = useState(false);

  const nav = [
    { id: "what-we-check", label: "What we check" },
    { id: "how-it-works", label: "How it works" },
    { id: "about-report", label: "About" },
    { id: "faq", label: "FAQs" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#04070d]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/sydneyprepurchase" className="shrink-0">
          <Logo variant="onDark" height={36} linked={false} />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={() => scrollTo("book")}
            className="inline-flex h-9 items-center rounded-full bg-accent-500 px-4 text-sm font-bold text-white transition hover:bg-accent-600"
          >
            Book inspection
          </button>
          <a
            href={`mailto:${AUTOVERIFI_CONTACT_EMAIL}`}
            className="inline-flex h-9 items-center rounded-full border border-white/25 px-4 text-sm font-semibold text-white transition hover:border-white/50"
          >
            Contact us
          </a>
          <a
            href={SYDNEY_PPI_PHONE_HREF}
            className="inline-flex items-center gap-1.5 pl-2 text-sm font-semibold text-white"
          >
            <Phone className="h-4 w-4 text-accent-400" aria-hidden />
            {SYDNEY_PPI_PHONE}
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[#04070d] px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  scrollTo(item.id);
                }}
                className="text-left text-sm font-medium text-slate-200"
              >
                {item.label}
              </button>
            ))}
            <a
              href={SYDNEY_PPI_PHONE_HREF}
              className="text-sm font-semibold text-white"
            >
              {SYDNEY_PPI_PHONE}
            </a>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                scrollTo("book");
              }}
              className="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-accent-500 text-sm font-bold text-white"
            >
              Book inspection
            </button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="scroll-mt-24 border-t border-white/10 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
          Common questions
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Answers before you book
        </h2>
        <ul className="mt-10 divide-y divide-white/10">
          {PPI_FAQ.map((item, index) => {
            const open = openIndex === index;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-base font-semibold text-white">
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
                  <p className="pb-5 text-sm leading-relaxed text-slate-400">
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
    <div className="min-h-screen bg-black text-white">
      <SydneyHeader />

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-400">
            Pre-purchase inspections · Sydney wide
          </p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">
            Buy with confidence with a comprehensive mobile pre-purchase
            inspection
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-400">
            A qualified inspector travels to the vehicle, completes an identity
            verification, mechanical, body and interior inspection, then sends
            you a photo-backed digital report the same day.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => scrollTo("book")}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-accent-500 px-6 text-sm font-bold text-white transition hover:bg-accent-600"
            >
              Book inspection
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => scrollTo("what-we-check")}
              className="inline-flex h-11 items-center rounded-full border border-white/30 px-6 text-sm font-semibold text-white transition hover:border-white/60"
            >
              See what we check
            </button>
          </div>
        </div>
        <figure className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50">
          <Image
            src={HERO_IMAGE}
            alt="Auto Verifi inspector at vehicle"
            fill
            className="object-cover object-[42%_45%]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </figure>
      </section>

      <section
        id="what-we-check"
        className="scroll-mt-24 border-t border-white/10 bg-[#03060c] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
            What we inspect
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PPI_VEHICLE_TYPES.map((card) => {
              const Icon = VEHICLE_ICONS[card.id];
              return (
                <article
                  key={card.id}
                  className="relative rounded-2xl border border-white/10 bg-[#0c1528] p-5"
                >
                  <ArrowUpRight
                    className="absolute right-4 top-4 h-4 w-4 text-slate-500"
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
                </article>
              );
            })}
          </div>

          <h2 className="mt-16 text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
            The 100+ point inspection
          </h2>
          <p className="mt-3 max-w-2xl text-2xl font-bold text-white sm:text-3xl">
            What a pre-purchase inspection actually covers
          </p>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
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
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-24 border-t border-white/10 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Booked today, reported today
          </h2>
          <p className="mt-3 max-w-2xl text-slate-400">
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
        </div>
      </section>

      <section
        id="about-report"
        className="scroll-mt-24 border-t border-white/10 bg-[#03060c] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
            The deliverable
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-extrabold text-white sm:text-4xl">
            A report you can act on, not a list of jargon
          </h2>
          <p className="mt-4 max-w-2xl text-slate-400">
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
            <button
              type="button"
              onClick={() => scrollTo("book")}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-accent-500 px-6 text-sm font-bold text-white"
            >
              Book inspection
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <Link
              href="/sample-report"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-6 text-sm font-semibold text-white"
            >
              View a sample report
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
        </div>
      </section>

      <FaqSection />

      <section className="border-t border-white/10 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1528] to-[#060a14] p-8 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
              Ready when you are
            </p>
            <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
              Confirm the details and location of the car you are buying and we
              will do the rest
            </h2>
            <p className="mt-3 text-slate-400">
              Tell us the vehicle and the suburb and we will confirm a fixed
              price and the next available inspection time.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => scrollTo("book")}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-accent-500 px-6 text-sm font-bold text-white"
              >
                Book inspection
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => scrollTo("faq")}
                className="inline-flex h-11 items-center rounded-full border border-white/30 px-6 text-sm font-semibold text-white"
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
        </div>
      </section>

      <section
        id="book"
        className="scroll-mt-24 border-t border-white/10 bg-[#03060c] py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <PrePurchaseBookingForm
            variant="dark"
            showVehicleCategory
            cancelReturnPath="/sydneyprepurchase"
          />
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <Logo variant="onDark" height={32} linked={false} />
          <div className="text-sm text-slate-500">
            <p className="font-semibold uppercase tracking-wider text-slate-400">
              Pre purchase inspections
            </p>
            <Link href="/privacy" className="mt-2 block hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="mt-1 block hover:text-white">
              Terms
            </Link>
          </div>
          <div className="text-sm text-slate-500">
            <p className="font-semibold uppercase tracking-wider text-slate-400">
              Company
            </p>
            <a
              href={`mailto:${AUTOVERIFI_CONTACT_EMAIL}`}
              className="mt-2 block hover:text-white"
            >
              Contact
            </a>
            <a href={SYDNEY_PPI_PHONE_HREF} className="mt-1 block hover:text-white">
              {SYDNEY_PPI_PHONE}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}