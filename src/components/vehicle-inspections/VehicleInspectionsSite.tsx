import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  ClipboardCheck,
  FileText,
  Mail,
  Scale,
  ShieldCheck,
} from "lucide-react";

const SERVICE_ITEMS = [
  {
    icon: ClipboardCheck,
    title: "Independent vehicle inspections",
    text: "Structured, evidence-based inspections for fleet, procurement and dispute resolution.",
  },
  {
    icon: ShieldCheck,
    title: "Motor dealer assessment",
    text: "Operational and compliance reviews for dealer groups, OEM programs and retail networks.",
  },
  {
    icon: Scale,
    title: "Expert witness services",
    text: "Clear, defensible reporting and testimony supported by digital evidence capture.",
  },
  {
    icon: Camera,
    title: "Digital evidence capture",
    text: "Photo, video and structured checklists with secure reporting and audit trails.",
  },
  {
    icon: FileText,
    title: "Quality assurance",
    text: "Rigorous QA processes, reviewer sign-off and consistent reporting standards.",
  },
  {
    icon: BadgeCheck,
    title: "Government & fleet ready",
    text: "Built for tender submissions, fleet procurement and insurer workflows.",
  },
];

const HIGHLIGHTS = [
  "Independent, evidence-based assessments",
  "30+ years of automotive inspection expertise",
  "Digital evidence capture & secure reporting",
];

export function VehicleInspectionsSite() {
  return (
    <div className="-mt-[76px] bg-[#07111f] text-white sm:-mt-[80px]">
      {/* Hero */}
      <section className="relative overflow-hidden pt-[76px] sm:pt-[80px]">
        <div className="absolute inset-0">
          <Image
            src="/vehicle-inspections/hero-reference.png"
            alt=""
            fill
            priority
            className="object-cover object-top opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-[#07111f]/90 to-[#0b1f3d]/80" />
        </div>

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="block text-white">Independent special purpose</span>
              <span className="mt-1 block text-[#4da3ff]">
                Vehicle Inspection Services
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Auto Verifi delivers independent vehicle inspection, motor dealer
              assessment and expert witness services — combining decades of
              operational expertise with digital evidence capture and rigorous
              quality assurance.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-slate-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2563eb]">
                <BadgeCheck className="h-4 w-4 text-white" aria-hidden />
              </span>
              Independent, evidence-based assessments
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
              <Image
                src="/vehicle-inspections/hero-reference.png"
                alt="Vehicle inspection workstation with digital evidence capture"
                width={960}
                height={720}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section
        id="services"
        className="relative scroll-mt-28 overflow-hidden sm:scroll-mt-32"
      >
        <div className="absolute inset-0">
          <Image
            src="/vehicle-inspections/services-reference.png"
            alt=""
            fill
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-[#07111f]/88" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-4xl font-extrabold tracking-tight text-[#4da3ff] sm:text-5xl">
            Services
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Auto Verifi delivers independent vehicle inspection, motor dealer
            assessment and expert witness services — combining decades of
            operational expertise with digital evidence capture and rigorous
            quality assurance.
          </p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-100">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563eb]">
                  <BadgeCheck className="h-4 w-4 text-white" aria-hidden />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#services-grid"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1d4ed8]"
            >
              Explore services
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-xl border border-[#2563eb] px-6 py-3.5 text-sm font-bold text-[#93c5fd] transition hover:bg-[#2563eb]/10"
            >
              Request an inspection
            </a>
          </div>

          <div
            id="services-grid"
            className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {SERVICE_ITEMS.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563eb]/20 text-[#93c5fd]">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="scroll-mt-28 border-t border-white/10 bg-[#081423] sm:scroll-mt-32"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              About us
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              Auto Verifi is an independent automotive assessment provider
              supporting government, fleet, insurer and legal workflows across
              Australia. Our teams combine field inspection experience with
              structured digital reporting designed for procurement, dispute
              resolution and compliance review.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              From special-purpose vehicle inspections to expert witness
              preparation, every engagement is delivered with evidence capture,
              reviewer QA and clear, defensible documentation.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1d4ed8]/20 to-transparent p-8">
            <h3 className="text-xl font-bold text-white">Why clients choose us</h3>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li>Independent assessments with no conflict of interest</li>
              <li>Digital evidence workflows and secure report delivery</li>
              <li>Experienced inspectors and structured QA review</li>
              <li>Ready for government tender and fleet procurement use cases</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section
        id="contact"
        className="scroll-mt-28 border-t border-white/10 sm:scroll-mt-32"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Contact us
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-300">
                Request an inspection, tender capability statement or expert
                witness engagement. Our team will respond with scope, timing and
                next steps.
              </p>
              <a
                href="mailto:support@autoverifi.com.au?subject=Vehicle%20Inspection%20Request"
                className="mt-6 inline-flex items-center gap-2 text-[#93c5fd] transition hover:text-white"
              >
                <Mail className="h-4 w-4" aria-hidden />
                support@autoverifi.com.au
              </a>
            </div>

            <form
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8"
              action="mailto:support@autoverifi.com.au"
              method="post"
              encType="text/plain"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block text-slate-300">Name</span>
                  <input
                    name="name"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white outline-none ring-[#2563eb] focus:ring-2"
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-slate-300">Email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white outline-none ring-[#2563eb] focus:ring-2"
                  />
                </label>
              </div>
              <label className="mt-4 block text-sm">
                <span className="mb-1.5 block text-slate-300">Organisation</span>
                <input
                  name="organisation"
                  className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white outline-none ring-[#2563eb] focus:ring-2"
                />
              </label>
              <label className="mt-4 block text-sm">
                <span className="mb-1.5 block text-slate-300">Message</span>
                <textarea
                  name="message"
                  rows={5}
                  required
                  placeholder="Tell us about the vehicle, location and inspection required."
                  className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-white outline-none ring-[#2563eb] focus:ring-2"
                />
              </label>
              <button
                type="submit"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1d4ed8] sm:w-auto"
              >
                Request an inspection
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
