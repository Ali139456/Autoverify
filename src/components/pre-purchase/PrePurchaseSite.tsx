import Image from "next/image";
import Link from "next/link";
import { PPI_SAMPLE_REPORT_HREF } from "@/lib/pre-purchase/sample-report";
import { SYDNEY_PPI_BOOK_HREF } from "@/lib/pre-purchase/sydney-ppi-paths";
import { PrePurchaseBookingSection } from "./PrePurchaseBookingSection";

const PPI_HERO_IMAGE = "/vehicle-inspections/pre-purchase-hero.png";

export function PrePurchaseSite() {
  return (
    <div className="w-full bg-black">
      <section className="border-b border-white/10 py-14 sm:py-16">
        <div className="av-site-container grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="min-w-0 space-y-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-400">
              Pre-purchase inspections
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-[1.85rem] lg:leading-snug">
              Buy with confidence with a comprehensive mobile pre-purchase
              inspection
            </h1>
            <p className="max-w-xl text-base text-slate-400">
              A qualified inspector attends the vehicle onsite, inspects the
              mechanical, interior and body condition and delivers a digital
              report with photos.
            </p>
            <p className="mt-6 flex flex-wrap gap-4">
              <Link
                href={SYDNEY_PPI_BOOK_HREF}
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent-600 underline-offset-2 hover:underline dark:text-accent-400"
              >
                Sydney book inspection
              </Link>
              <Link
                href={PPI_SAMPLE_REPORT_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent-400 underline-offset-2 hover:underline"
              >
                Download sample pre-purchase report (PDF)
              </Link>
            </p>
          </div>
          <figure className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-lg">
            <Image
              src={PPI_HERO_IMAGE}
              alt="Qualified mobile inspector assessing a vehicle before purchase"
              fill
              className="object-cover object-[42%_45%] brightness-[1.06] contrast-[1.03]"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </figure>
        </div>
      </section>
      <PrePurchaseBookingSection />
    </div>
  );
}