import Image from "next/image";
import { Briefcase, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const INTRO =
  "Our founders bring more than 40 years of specialist automotive and vehicle inspection experience, with a proven track record of building and scaling market-leading automotive businesses. We created Auto Verifi with a clear purpose: to bring greater trust, transparency and intelligence to vehicle ownership. By combining deep industry expertise with innovative technology and data, we're helping car buyers, owners, lenders and industry partners make better-informed decisions about vehicles.";

export function AboutUsSection() {
  return (
    <section
      id="about"
      className="relative scroll-mt-24 overflow-hidden border-t border-slate-200 bg-white py-12 dark:border-white/10 dark:bg-ink-900 sm:py-16 lg:py-20"
    >
      <div className="pointer-events-none absolute -top-40 right-0 h-[400px] w-[400px] rounded-full bg-accent-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-500 dark:text-accent-400">
            About us
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Built on decades of{" "}
            <span className="text-accent-500 dark:text-accent-400">automotive expertise</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
            {INTRO}
          </p>
        </Reveal>

        <div className="mt-12 space-y-16 sm:mt-16 sm:space-y-20">
          <Reveal>
            <div className="grid items-center gap-10 lg:grid-cols-[280px_1fr]">
              <div className="mx-auto lg:mx-0">
                <div className="relative h-56 w-56 overflow-hidden rounded-full border-4 border-slate-200 dark:border-white/10 sm:h-64 sm:w-64">
                  <Image
                    src="/67a7dccc6e9273798fd70280-HeadshotPro-1.webp"
                    alt="Theo Cosmetatos"
                    fill
                    className="object-cover object-top"
                    sizes="256px"
                  />
                </div>
              </div>
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent-500 dark:text-accent-400">
                  <Briefcase className="h-4 w-4" aria-hidden />
                  Co-Founder
                </p>
                <h3 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                  Theo Cosmetatos
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                  With over 30 years of specialist expertise in the automotive
                  industry, Theo is a qualified mechanic, a member of the Institute
                  of Mechanical Engineers and a licensed panel beater. Theo has a
                  successful track record in automotive services, co-founding
                  Australia&apos;s leading vehicle inspections business, RedBook
                  Inspect, which was acquired by an ASX Top 50 company.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid items-start gap-10 lg:grid-cols-[1fr_280px]">
              <div className="order-2 lg:order-1">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent-500 dark:text-accent-400">
                  <TrendingUp className="h-4 w-4" aria-hidden />
                  Co-Founder
                </p>
                <h3 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
                  Denise Cosmetatos
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                  With over 25 years of experience in the finance, investment,
                  technology and advisory industries, Denise holds a Bachelor of
                  Commerce, is a CPA, has a PWC Audit lead accreditation and has
                  completed her Graduate Diploma in Financial markets with FINSIA.
                  After holding senior positions in the finance and investment
                  management industry, Denise co-founded Australia&apos;s leading
                  vehicle inspections business, RedBook Inspect, which was acquired
                  by an ASX Top 50 company.
                </p>
              </div>
              <div className="order-1 mx-auto lg:order-2 lg:mx-0">
                <div className="relative h-56 w-56 overflow-hidden rounded-full border-4 border-slate-200 dark:border-white/10 sm:h-64 sm:w-64">
                  <Image
                    src="/Linkedin-Headshot_DC.webp"
                    alt="Denise Cosmetatos"
                    fill
                    className="object-cover object-top"
                    sizes="256px"
                  />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
