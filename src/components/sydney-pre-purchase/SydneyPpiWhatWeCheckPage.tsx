import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PPI_INSPECTION_GROUPS } from "@/lib/pre-purchase/sydney-landing-content";
import { PPI_SAMPLE_REPORT_HREF } from "@/lib/pre-purchase/sample-report";
import { SYDNEY_PPI_BOOK_HREF } from "@/lib/pre-purchase/sydney-ppi-paths";
import { SydneyPpiFooter, SydneyPpiHeader } from "./sydney-ppi-chrome";
import { SydneyPpiPage, SydneyPpiSection } from "./sydney-ppi-layout";
import { SydneyPpiPageHero } from "./SydneyPpiPageHero";
import { SydneyPpiCtaBand } from "./SydneyPpiCtaBand";

const GRADES = [
  {
    tone: "bg-emerald-500",
    title: "Good (green)",
    text: "Working order with no obvious damage, or wear consistent with the vehicle's age and kilometres.",
  },
  {
    tone: "bg-orange-500",
    title: "Fair (orange)",
    text: "Working, but with noticeable wear or minor damage. Monitor it and use it when negotiating.",
  },
  {
    tone: "bg-red-500",
    title: "Repair or investigation needed (red)",
    text: "Not in working order, or significant damage or wear. Get it inspected or quoted before you commit.",
  },
] as const;

const STATS = [
  ["100+", "Points checked on every vehicle"],
  ["Same day", "Photo-backed report delivered"],
  ["Onsite", "We travel to the vehicle"],
  ["Independent", "We work for you, not the seller"],
] as const;

export function SydneyPpiWhatWeCheckPage() {
  return (
    <SydneyPpiPage>
      <SydneyPpiHeader />
      <SydneyPpiPageHero
        eyebrow="The checklist"
        title="What a pre-purchase inspection covers"
        description="A comprehensive check covering body and paint, mechanical, chassis and suspension, brakes and tyres, interior and electrics, diagnostics, compliance and history, and a road test — so you can buy with confidence."
      />

      <SydneyPpiSection innerClassName="py-14 sm:py-16 lg:py-20">
        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
          The 100+ point inspection
        </h2>
        <p className="mt-3 max-w-2xl text-2xl font-bold text-white sm:text-3xl">
          What a pre-purchase inspection actually covers
        </p>
        <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
          Each group below is checked, graded and photographed on site. Anything
          that needs attention is listed in the report with a severity rating
          and repair guidance.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PPI_INSPECTION_GROUPS.map((group) => (
            <div
              key={group.title}
              className="rounded-2xl border border-white/10 bg-[#0a1220] p-4"
            >
              <h3 className="text-sm font-bold text-white">{group.title}</h3>
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
          {STATS.map(([title, body]) => (
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
        className="border-t border-white/10"
        innerClassName="py-14 sm:py-16"
      >
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          How findings are graded
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {GRADES.map((grade) => (
            <div
              key={grade.title}
              className="rounded-2xl border border-white/10 bg-[#0c1528] p-6"
            >
              <span
                className={`block h-2 w-10 rounded-full ${grade.tone}`}
                aria-hidden
              />
              <h3 className="mt-4 text-lg font-semibold text-white">
                {grade.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {grade.text}
              </p>
            </div>
          ))}
        </div>
      </SydneyPpiSection>

      <SydneyPpiSection
        className="border-t border-white/10 bg-[#03060c]"
        innerClassName="py-14 sm:py-16"
      >
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
          The deliverable
        </p>
        <h2 className="mt-3 max-w-3xl text-2xl font-extrabold text-white sm:text-3xl">
          A report you can act on, not a list of jargon
        </h2>
        <p className="mt-4 max-w-2xl text-slate-400">
          Everything found on site becomes a graded finding with a photograph.
          Forward it to the seller, take it to a mechanic, or use it to walk
          away.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
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
            View a sample report
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </SydneyPpiSection>

      <SydneyPpiCtaBand />
      <SydneyPpiFooter />
    </SydneyPpiPage>
  );
}