"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { TERMS_PAGE_TITLE } from "@/content/terms-of-use";

export function PaymentTermsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-terms-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/60"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative max-h-[min(85vh,640px)] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-ink-900">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4 dark:border-white/10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0073E3]">
              Before you pay
            </p>
            <h2
              id="payment-terms-title"
              className="mt-1 text-lg font-bold text-slate-900 dark:text-white"
            >
              Important information
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="max-h-[calc(min(85vh,640px)-8rem)] overflow-y-auto px-6 py-5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            Auto Verifi reports combine information from third-party databases,
            registers and technology partners. Information may be incomplete or
            change after your report is generated.
          </p>
          <p className="mt-3">
            A report is not a mechanical inspection, roadworthiness certificate
            or guarantee of vehicle condition or value. You remain responsible for
            your purchase decision and any additional enquiries or inspections
            you consider necessary.
          </p>
          <p className="mt-3">
            By proceeding, you confirm you have read and agree to our{" "}
            <Link
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#0073E3] underline-offset-2 hover:underline"
            >
              {TERMS_PAGE_TITLE}
            </Link>{" "}
            and Privacy Policy.
          </p>
        </div>
        <div className="border-t border-slate-200 px-6 py-4 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#0073E3] px-4 py-3 text-sm font-bold text-white hover:bg-[#0062c2]"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}
