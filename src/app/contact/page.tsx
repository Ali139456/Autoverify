import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import {
  AUTOVERIFI_CONTACT_EMAIL,
  getContactInboxEmail,
} from "@/lib/site-contact";

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
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4da3ff]/30 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-[#2563eb]/20 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-[#0073E3]/10 blur-[120px]"
        aria-hidden
      />

      <div className="relative mx-auto w-full min-w-0 max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:items-start lg:gap-14">
          <div className="max-w-lg">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-[2.65rem] lg:leading-tight">
              Contact us
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
              Have a question? We&apos;d love to hear from you. Send us a message
              and we&apos;ll respond as soon as possible.
            </p>
            <p className="mt-8 text-sm text-slate-400">Or reach us directly at:</p>
            <a
              href={`mailto:${inbox}`}
              className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-[#93c5fd] transition hover:text-white"
            >
              <Mail className="h-5 w-5 shrink-0" aria-hidden />
              {inbox}
            </a>
            <p className="mt-10 text-xs leading-relaxed text-slate-500">
              For report access or payment issues, include your report reference
              (AV-…) if you have one. Messages are sent securely to our team inbox (
              {AUTOVERIFI_CONTACT_EMAIL}).
            </p>
          </div>

          <ContactForm />
        </div>
      </div>
    </div>
  );
}
