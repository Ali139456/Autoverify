"use client";

import { useEffect } from "react";
import { Search, X } from "lucide-react";
import { RegoSearchForm } from "@/components/RegoSearchForm";
import { formatTierPrice } from "@/lib/pricing";

export const BUY_REPORT_MODAL_INPUT_ID = "buy-report-modal-input";

export function BuyReportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => {
      const input = document.getElementById(
        BUY_REPORT_MODAL_INPUT_ID,
      ) as HTMLInputElement | null;
      input?.focus({ preventScroll: true });
    }, 50);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/92 px-4 py-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buy-report-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-ink-950 p-6 text-left shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0073E3]/15 text-[#0073E3]">
          <Search className="h-6 w-6" aria-hidden />
        </span>
        <h2
          id="buy-report-modal-title"
          className="mt-4 text-xl font-bold text-white sm:text-2xl"
        >
          Buy a vehicle report
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter the registration plate (or VIN) and state to get started. Reports
          from {formatTierPrice("insights")}.
        </p>

        <div className="mt-5">
          <RegoSearchForm compact onDark inputId={BUY_REPORT_MODAL_INPUT_ID} />
        </div>
      </div>
    </div>
  );
}
