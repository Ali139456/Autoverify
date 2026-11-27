import Link from "next/link";
import { ArrowRight, Bike, Car, Truck, Zap } from "lucide-react";
import { SYDNEY_PPI_SERVICES } from "@/lib/pre-purchase/sydney-ppi-services";
import { sydneyPpiServiceHref } from "@/lib/pre-purchase/sydney-ppi-paths";
import { SydneyPpiFooter, SydneyPpiHeader } from "./sydney-ppi-chrome";
import { SydneyPpiPage, SydneyPpiSection } from "./sydney-ppi-layout";
import { SydneyPpiPageHero } from "./SydneyPpiPageHero";
import { SydneyPpiCtaBand } from "./SydneyPpiCtaBand";

const ICONS = {
  passenger: Car,
  commercial: Truck,
  ev: Zap,
  caravan: Truck,
  motorcycle: Bike,
} as const;

export function SydneyPpiServicesIndexPage() {
  return (
    <SydneyPpiPage>
      <SydneyPpiHeader />
      <SydneyPpiPageHero
        eyebrow="Inspection services"
        title="Choose the inspection that matches the vehicle."
        description="Each vehicle type has its own checklist, its own common failures and its own repair costs. We inspect every type onsite, anywhere across Sydney and surrounding regions."
      />
      <SydneyPpiSection innerClassName="py-14 sm:py-16 lg:py-20">
        <div className="divide-y divide-white/10 border-y border-white/10">
          {SYDNEY_PPI_SERVICES.map((service) => {
            const Icon = ICONS[service.categoryId];
            return (
              <article
                key={service.slug}
                className="grid items-center gap-8 py-10 sm:py-12 md:grid-cols-[1fr_10rem] md:gap-12"
              >
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent-400">
                    {service.eyebrow}
                  </p>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-white">
                    {service.label} inspection
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-[0.95rem]">
                    {service.intro}
                  </p>
                  <p className="mt-4 text-[13px] text-slate-400">
                    <span className="font-semibold text-white">Best for:</span>{" "}
                    {service.bestFor}
                  </p>
                  <Link
                    href={sydneyPpiServiceHref(service.slug)}
                    className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-sm font-semibold text-white transition hover:border-white/50"
                  >
                    View the {service.label.toLowerCase()} checklist
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
                <div className="flex justify-center md:justify-end">
                  <div className="flex h-36 w-36 items-center justify-center rounded-2xl border border-white/10 bg-[#0c1528] sm:h-40 sm:w-40">
                    <Icon className="h-16 w-16 text-white/90" aria-hidden />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </SydneyPpiSection>
      <SydneyPpiCtaBand />
      <SydneyPpiFooter />
    </SydneyPpiPage>
  );
}