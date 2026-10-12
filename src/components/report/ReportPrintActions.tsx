"use client";

import { Download, Printer } from "lucide-react";

type ReportPrintActionsProps = {
  /** Server-generated PDF (works in mobile in-app browsers when print does not). */
  pdfDownloadUrl?: string;
};

export function ReportPrintActions({ pdfDownloadUrl }: ReportPrintActionsProps) {
  function handlePrint() {
    if (typeof window === "undefined") return;
    window.print();
  }

  return (
    <div className="report-no-print flex w-full min-w-0 flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-center sm:justify-end">
      {pdfDownloadUrl ? (
        <a
          href={pdfDownloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#0073E3] bg-white px-6 py-3 text-sm font-bold text-[#0073E3] transition hover:bg-[#0073E3]/5 dark:bg-ink-900 dark:hover:bg-[#0073E3]/10 sm:w-auto"
        >
          <Download className="h-5 w-5 shrink-0" aria-hidden />
          Download PDF
        </a>
      ) : null}
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0073E3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0062c2] sm:w-auto"
      >
        <Printer className="h-5 w-5 shrink-0" aria-hidden />
        Print / Save as PDF
      </button>
    </div>
  );
}
