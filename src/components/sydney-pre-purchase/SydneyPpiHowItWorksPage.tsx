import { Check } from "lucide-react";
import {
  PPI_FAQ,
  PPI_HOW_IT_WORKS,
} from "@/lib/pre-purchase/sydney-landing-content";
import {
  SydneyPpiFooter,
  SydneyPpiHeader,
  PAGE_CONTAINER,
} from "./sydney-ppi-chrome";
import { SydneyPpiPageHero } from "./SydneyPpiPageHero";
import { SydneyPpiCtaBand } from "./SydneyPpiCtaBand";
import { SydneyPpiFaqAccordion } from "./SydneyPpiFaqAccordion";

const PREPARE = [
  "The make, model, year and variant of the vehicle",
  "The suburb or postcode where the vehicle is stored",
  "Whether it is a private seller, dealer or auction",
  "Any specific concern you want checked first",
] as const;

const FAQ_SLICE = PPI_FAQ.slice(2, 8);

export function SydneyPpiHowItWorksPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <SydneyPpiHeader />
      <SydneyPpiPageHero
        eyebrow="The process"
        title="How a mobile pre-purchase inspection works"
      />

      <section className={`${PAGE_CONTAINER} py-14 sm:py-16 lg:py-20`}>
        <ol className="grid gap-5 sm:grid-cols-2">
          {PPI_HOW_IT_WORKS.map((step) => (
            <li
              key={step.step}
              className="rounded-2xl border border-white/10 bg-[#0c1528] p-6 sm:p-7"
            >
              <span className="text-[11px] font-bold tracking-[0.2em] text-accent-400">
                {step.step}
              </span>
              <h2 className="mt-4 text-xl font-bold text-white">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {step.body}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12 rounded-2xl border border-white/10 bg-[#08090c] p-7 sm:p-9">
          <h2 className="text-lg font-semibold text-white">
            What to have ready when you book
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {PREPARE.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-sm leading-relaxed text-slate-400"
              >
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent-400"
                  strokeWidth={2.5}
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#03060c] py-14 sm:py-16 lg:py-20">
        <div className={PAGE_CONTAINER}>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
            Common questions
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Everything else you might ask
          </h2>
          <div className="mt-10">
            <SydneyPpiFaqAccordion items={FAQ_SLICE} />
          </div>
        </div>
      </section>

      <SydneyPpiCtaBand />
      <SydneyPpiFooter />
    </div>
  );
}