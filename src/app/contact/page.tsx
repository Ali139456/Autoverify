import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { getContactInboxEmail } from "@/lib/site-contact";

export const metadata: Metadata = {
  title: "Contact us — Auto Verifi",
  description:
    "Contact the Auto Verifi team about vehicle reports, Insights+ inspections, payments, or partnerships.",
};

export default function ContactPage() {
  const inbox = getContactInboxEmail();

  return (
    <div className="relative min-h-[calc(100vh-6rem)] w-full min-w-0 overflow-x-clip bg-ink-950 text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,115,227,0.22),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(0,115,227,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(0,115,227,0.07)_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />

      <div className="relative mx-auto w-full min-w-0 max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#0073E3]">
          Auto Verifi
        </p>

        <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-[#0073E3]/20 bg-gradient-to-br from-[#0c1222]/95 via-ink-900/90 to-[#061018]/95 shadow-[0_32px_80px_rgba(0,0,0,0.55)] backdrop-blur-sm">
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#0073E3] to-transparent opacity-80" />

          <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12 lg:p-10 xl:p-12">
            <div className="flex flex-col justify-center lg:max-w-md">
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Contact us
              </h1>
              <p className="mt-4 text-base leading-relaxed text-slate-300">
                Have a question? We&apos;d love to hear from you.
              </p>

              <div className="mt-8 space-y-4 border-t border-white/10 pt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Or email us directly
                </p>
                <a
                  href={`mailto:${inbox}`}
                  className="inline-flex items-center gap-2.5 text-lg font-semibold text-[#0073E3] transition hover:text-white"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0073E3]/30 bg-[#0073E3]/10">
                    <Mail className="h-5 w-5 shrink-0" aria-hidden />
                  </span>
                  {inbox}
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#050a14]/60 p-5 sm:p-6 lg:p-7">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
