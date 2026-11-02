import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SolutionPageContent } from "@/content/solution-pages";

const PAST_PRESENT_FUTURE = [
  { label: "Past", start: 0, count: 7 },
  { label: "Present", start: 7, count: 7 },
  { label: "Future", start: 14, count: 5 },
] as const;

export function SolutionAudiencePage({ page }: { page: SolutionPageContent }) {
  const intelligenceSection = page.sections[0];
  const showThreeLayers =
    page.slug === "consumer" &&
    intelligenceSection?.bullets &&
    intelligenceSection.bullets.length >= 19;

  return (
    <div className="relative min-h-[calc(100vh-6rem)] w-full min-w-0 overflow-x-clip bg-ink-950 text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,115,227,0.22),transparent)]"
        aria-hidden
      />

      <div className="av-site-container relative py-10 sm:py-14 lg:py-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent-400">
          Solutions · {page.title}
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          {page.heroTitle}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          {page.heroIntro}
        </p>

        <div className="mt-12 space-y-14 sm:mt-16 sm:space-y-16">
          {page.sections.map((section) => (
            <section key={section.heading} className="max-w-5xl">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                {section.heading}
              </h2>
              {section.subheading ? (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
                  {section.subheading}
                </p>
              ) : null}

              {section.bullets && showThreeLayers && section === intelligenceSection ? (
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {PAST_PRESENT_FUTURE.map(({ label, start, count }) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-[#0a1230]/90 p-5 sm:p-6"
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-400">
                        {label}
                      </p>
                      <ul className="mt-4 list-none space-y-2.5 p-0 text-sm text-slate-200">
                        {section.bullets!.slice(start, start + count).map((item) => (
                          <li key={item} className="flex gap-2.5">
                            <span
                              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                              aria-hidden
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : section.bullets ? (
                <ul className="mt-6 grid list-none gap-x-8 gap-y-2.5 p-0 sm:grid-cols-2">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-slate-200">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        {page.cta ? (
          <div className="mt-14 rounded-2xl border border-accent-500/30 bg-gradient-to-br from-accent-600/20 to-[#0a1230] p-6 sm:mt-16 sm:p-8">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              {page.cta.heading}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
              {page.cta.text}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-600"
              >
                Speak to an expert
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/#check"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:border-accent-500/50 hover:bg-white/5"
              >
                Buy report
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
