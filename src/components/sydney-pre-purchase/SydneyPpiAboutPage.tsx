import {
  SYDNEY_PPI_ABOUT_INTRO,
  SYDNEY_PPI_FOUNDERS,
} from "@/lib/pre-purchase/sydney-ppi-founders";
import {
  SydneyPpiFooter,
  SydneyPpiHeader,
  PAGE_CONTAINER,
} from "./sydney-ppi-chrome";
import { SydneyPpiPageHero } from "./SydneyPpiPageHero";
import { SydneyPpiCtaBand } from "./SydneyPpiCtaBand";

export function SydneyPpiAboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <SydneyPpiHeader />
      <SydneyPpiPageHero
        eyebrow="About us"
        title="Built on decades of automotive expertise"
        description={SYDNEY_PPI_ABOUT_INTRO}
      />

      <section className={`${PAGE_CONTAINER} py-14 sm:py-16 lg:py-20`}>
        <div className="grid gap-4 sm:grid-cols-2">
          {SYDNEY_PPI_FOUNDERS.map((founder) => (
            <article
              key={founder.name}
              className="flex flex-col rounded-2xl border border-accent-500/30 bg-gradient-to-br from-[#0b1f4d] via-[#0a1838] to-[#0a1228] p-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent-500 text-base font-bold text-white">
                  {founder.initials}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {founder.name}
                  </h2>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-400">
                    {founder.role}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-slate-300">
                {founder.bio}
              </p>
            </article>
          ))}
        </div>
      </section>

      <SydneyPpiCtaBand />
      <SydneyPpiFooter />
    </div>
  );
}