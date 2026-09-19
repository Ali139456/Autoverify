"use client";

import { Download, Printer } from "lucide-react";

export function ReportPrintActions({ pdfUrl }: { pdfUrl: string }) {
  return (
    <div className="report-no-print flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0073E3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0062c2]"
      >
        <Printer className="h-5 w-5" aria-hidden />
        Print / Save as PDF
      </button>
      <a
        href={pdfUrl}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#0073E3] hover:text-[#0073E3]"
      >
        <Download className="h-4 w-4" aria-hidden />
        Download PDF
      </a>
    </div>
  );
}
