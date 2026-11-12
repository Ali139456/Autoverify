import Image from "next/image";
import { PrePurchaseBookingForm } from "./PrePurchaseBookingForm";

const PPI_HERO_IMAGE = "/vehicle-inspections/pre-purchase-hero.jpg";

export function PrePurchaseSite() {
  return (
    <div className="w-full">
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white py-14 dark:border-slate-800 dark:from-ink-950 dark:to-ink-900">
        <div className="av-site-container grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="min-w-0 space-y-6">
            <figure className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg dark:border-slate-700">
              <Image
                src={PPI_HERO_IMAGE}
                alt="Qualified mobile inspector assessing a vehicle before purchase"
                fill
                className="object-cover object-[42%_45%]"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </figure>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-500">
                Pre-purchase inspections
              </p>
              <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-[1.65rem] lg:leading-snug">
                Buy with confidence with a comprehensive mobile pre-purchase
                inspection
              </h1>
              <p className="mt-4 max-w-xl text-base text-slate-600 dark:text-slate-400">
                A qualified inspector attends the vehicle onsite, inspects the
                mechanical, interior and body condition and delivers a digital
                report with photos.
              </p>
              <ul className="mt-6 list-inside list-disc space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>On-site at seller address</li>
                <li>Road test where safe and permitted</li>
                <li>
                  Digital report instantly once inspection is completed
                </li>
              </ul>
            </div>
          </div>
          <PrePurchaseBookingForm />
        </div>
      </section>
    </div>
  );
}
