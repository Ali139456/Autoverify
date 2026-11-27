import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SYDNEY_INSPECTION_AREAS } from "@/lib/pre-purchase/sydney-landing-content";
import { SYDNEY_PPI_BOOK_HREF } from "@/lib/pre-purchase/sydney-ppi-paths";
import { PAGE_CONTAINER } from "./sydney-ppi-chrome";

export function SydneyPpiCtaBand({
  faqHref = "#faq",
}: {
  /** Optional FAQ link (hash on landing or dedicated route later). */
  faqHref?: string;
}) {
  const faqIsHash = faqHref.startsWith("#");

  return (
    <section className="w-full min-w-0 border-t border-white/10 py-16 sm:py-20">
      <div className={PAGE_CONTAINER}>
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
              className="inline-flex h-12 items-center gap-2 rounded-full bg-accent-500 px-7 text-base font-bold text-white transition hover:bg-accent-600"
            >
              Book inspection
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            {faqIsHash ? (
              <a
                href={faqHref}
                className="inline-flex h-12 items-center rounded-full border border-white/30 px-7 text-base font-semibold text-white transition hover:border-white/50"
              >
                Read the FAQs
              </a>
            ) : (
              <Link
                href={faqHref}
                className="inline-flex h-12 items-center rounded-full border border-white/30 px-7 text-base font-semibold text-white transition hover:border-white/50"
              >
                Read the FAQs
              </Link>
            )}
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
  );
}