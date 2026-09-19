import Image from "next/image";
import { Briefcase, Mail, MapPin, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const INTRO =
  "Our Founders have over 40 years of specialist experience in the auto sector and a proven track record building successful market leading auto businesses.";

const MISSION =
  "We are passionate about the importance of the Auto industry in context of its far reaching impact on the economy, society, the environment and technology, and have established Auto Ventures Global so we can innovate and collaborate with industry participants to deliver market leading businesses and achieve safer outcomes.";

const CLOSING =
  "We build, invest in, and advise businesses in the Auto Industry while solving important problems, and achieving safer outcomes.";

const CONTACT_EMAIL = "info@autoverifi.com.au";

export function AboutUsSection() {
  return (
    <section
      id="about"
      className="relative scroll-mt-24 overflow-hidden border-t border-white/10 bg-ink-900 py-12 sm:py-16 lg:py-20"
    >
      <div className="pointer-events-none absolute -top-40 right-0 h-[400px] w-[400px] rounded-full bg-accent-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-400">
            About us
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Built on decades of{" "}
            <span className="text-accent-400">automotive expertise</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">
            {INTRO}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
            {MISSION}
          </p>
        </Reveal>

        <div className="mt-12 space-y-16 sm:mt-16 sm:space-y-20">
          <Reveal>
            <div className="grid items-center gap-10 lg:grid-cols-[280px_1fr]">
              <div className="mx-auto lg:mx-0">
                <div className="relative h-56 w-56 overflow-hidden rounded-full border-4 border-white/10 sm:h-64 sm:w-64">
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
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
                  <Briefcase className="h-4 w-4" aria-hidden />
                  Co-Founder
                </p>
                <h3 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
                  Theo Cosmetatos
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                  With over 30 years of specialist expertise in the automotive
                  industry, Theo is a qualified mechanic, a member of the Institute
                  of Mechanical Engineers and a licensed panel beater. Theo has a
                  successful track record in automotive services, co-founding
                  Australia&apos;s leading vehicle inspections business, RedBook
                  Inspect, which was acquired by an ASX Top 50 company. Theo was
                  responsible for managing a large workforce of mechanics,
                  overseeing the delivery of over 1m used car inspections, winning
                  various State Transport tenders in respect of Passenger Transport
                  inspections, establishing and operating Accredited Inspection
                  Stations throughout Australia, and helping to shape best in class
                  operating and legislative practices in the Ride share industry.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="grid items-start gap-10 lg:grid-cols-[1fr_280px]">
              <div className="order-2 lg:order-1">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent-400">
                  <TrendingUp className="h-4 w-4" aria-hidden />
                  Co-Founder
                </p>
                <h3 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
                  Denise Cosmetatos
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                  With over 25 years of experience in the finance, investment,
                  technology and advisory industries, Denise holds a Bachelor of
                  Commerce, is a CPA, has a PWC Audit lead accreditation and has
                  completed her Graduate Diploma in Financial markets with FINSIA.
                  After holding senior positions in the finance and investment
                  management industry, Denise co-founded Australia&apos;s leading
                  vehicle inspections business, RedBook Inspect, which was acquired
                  by an ASX Top 50 company. During her tenure as CEO, this business
                  achieved a top 10 BRW Fast 100 ranking (2016) and 10x revenue over
                  a 3 year period. Denise was a founding member of digital inspection
                  technology, Olasio.com and is central to product innovation at Auto
                  Ventures from ideation to commercial execution and scale.
                </p>
              </div>
              <div className="order-1 mx-auto lg:order-2 lg:mx-0">
                <div className="relative h-56 w-56 overflow-hidden rounded-full border-4 border-white/10 sm:h-64 sm:w-64">
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

        <Reveal delay={150} className="mt-12 sm:mt-16">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-ink-950/60 p-6 sm:p-8">
            <p className="text-center text-sm leading-relaxed text-slate-300 sm:text-base">
              {CLOSING}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-4 text-sm text-slate-400 sm:flex-row sm:gap-8">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-accent-400" aria-hidden />
                Suite 60/Mezzanine 388 George St Sydney NSW 2000
              </span>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 font-medium text-accent-400 transition hover:text-accent-300"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden />
                {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
