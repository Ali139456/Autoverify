import Link from "next/link";
import { ArrowRight, Bike, Car, Check, Truck, Zap } from "lucide-react";
import {
  SYDNEY_PPI_SERVICE_FAQ,
  type SydneyPpiService,
  SYDNEY_PPI_SERVICES,
} from "@/lib/pre-purchase/sydney-ppi-services";
import {
  SYDNEY_PPI_BOOK_HREF,
  sydneyPpiBookWithCategory,
  sydneyPpiServiceHref,
} from "@/lib/pre-purchase/sydney-ppi-paths";
import { PPI_INSPECTION_GROUPS } from "@/lib/pre-purchase/sydney-landing-content";
import { PPI_HOW_IT_WORKS } from "@/lib/pre-purchase/sydney-landing-content";
import { PPI_SAMPLE_REPORT_HREF } from "@/lib/pre-purchase/sample-report";
import { SydneyPpiHeader, SydneyPpiFooter, PAGE_CONTAINER } from "./sydney-ppi-chrome";

const ICONS = {
  passenger: Car,
  commercial: Truck,
  ev: Zap,
  caravan: Truck,
  motorcycle: Bike,
} as const;

export function SydneyPpiServiceDetail({ service }: { service: SydneyPpiService }) {
  const Icon = ICONS[service.categoryId];
  const others = SYDNEY_PPI_SERVICES.filter((s) => s.slug !== service.slug);

  return (
    <div className="min-h-screen bg-black text-white">
      <SydneyPpiHeader />
      <section className="border-b border-white/10 bg-[#03060c]">
        <div
          className={`${PAGE_CONTAINER} grid items-center gap-10 py-14 sm:py-18 lg:grid-cols-[1.1fr_1fr] lg:gap-14`}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-400">
              {service.eyebrow} · Pre-purchase inspection
            </p>
            <h1 className="mt-5 text-[clamp(2rem,4.6vw,3.1rem)] font-extrabold leading-[1.05] tracking-tight text-white">
              {service.heading}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-400">
              {service.intro}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={sydneyPpiBookWithCategory(service.categoryId)}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent-500 px-7 text-sm font-bold text-white"
              >
                Book this inspection
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/sydneyprepurchase/what-we-check"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-7 text-sm font-semibold text-white"
              >
                Full 100+ point list
              </Link>
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-accent-400">
              Fixed price · {service.priceLabel}
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="flex h-40 w-40 items-center justify-center rounded-3xl border border-white/10 bg-[#0c1528]">
              <Icon className="h-20 w-20 text-white/90" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      <section className={`${PAGE_CONTAINER} py-16 sm:py-20`}>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              What we focus on for {service.label.toLowerCase()}
            </h2>
            <ul className="mt-7 space-y-4">
              {service.focus.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-slate-400"
                >
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent-400"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-7 rounded-xl border border-white/10 bg-[#0c1528] px-4 py-3.5 text-sm text-slate-300">
              <span className="font-semibold text-white">Best for:</span>{" "}
              {service.bestFor}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0c1528] p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-white">
              Also included on every inspection
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {PPI_INSPECTION_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-semibold text-white">
                    {group.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {group.items.join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-16 sm:py-20">
        <div className={PAGE_CONTAINER}>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
            How it works
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <section className="border-t border-white/10 bg-[#03060c] py-14 sm:py-16">
        <div className={PAGE_CONTAINER}>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={PPI_SAMPLE_REPORT_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-6 text-sm font-semibold text-white"
            >
              Download sample report (PDF)
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className={`${PAGE_CONTAINER} py-16 sm:py-20`}>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          {service.label} inspection questions
        </h2>
        <dl className="mt-8 grid gap-6 sm:grid-cols-2">
          {SYDNEY_PPI_SERVICE_FAQ.map((item) => (
            <div key={item.q}>
              <dt className="text-base font-semibold text-white">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-slate-400">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-sm text-slate-400">
          Inspecting a different vehicle type?{" "}
          {others.map((other, index) => (
            <span key={other.slug}>
              <Link
                href={sydneyPpiServiceHref(other.slug)}
                className="font-medium text-accent-400 underline-offset-4 hover:underline"
              >
                {other.label}
              </Link>
              {index < others.length - 2
                ? ", "
                : index === others.length - 2
                  ? " or "
                  : "."}
            </span>
          ))}
        </p>
      </section>

      <section className="border-t border-white/10 py-14">
        <div className={PAGE_CONTAINER}>
          <Link
            href={SYDNEY_PPI_BOOK_HREF}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-accent-500 px-8 text-base font-bold text-white"
          >
            Book inspection
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <SydneyPpiFooter />
    </div>
  );
}