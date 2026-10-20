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
    <div className="relative min-h-[calc(100vh-6rem)] w-full min-w-0 overflow-x-clip bg-white dark:bg-ink-950">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[820px] max-w-[100vw] -translate-x-1/2 rounded-full bg-accent-600/15 blur-[130px]" />
      <div className="relative mx-auto w-full min-w-0 max-w-5xl px-4 py-10 sm:px-6 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Contact us
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-400">
              Have a question? We&apos;d love to hear from you. Send us a message
              and we&apos;ll respond as soon as possible.
            </p>
            <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
              Or reach us directly at:
            </p>
            <a
              href={`mailto:${inbox}`}
              className="mt-2 inline-flex items-center gap-2 text-base font-semibold text-[#0073E3] transition hover:text-[#0062c2]"
            >
              <Mail className="h-5 w-5 shrink-0" aria-hidden />
              {inbox}
            </a>
            <p className="mt-8 text-xs leading-relaxed text-slate-500 dark:text-slate-500">
              For report access or payment issues, include your report reference
              (AV-…) if you have one. Messages are sent securely to our team inbox
              ({AUTOVERIFI_CONTACT_EMAIL}).
            </p>
          </div>

          <ContactForm />
        </div>
      </div>
    </div>
  );
}
