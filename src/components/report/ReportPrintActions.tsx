"use client";

import { Printer } from "lucide-react";

export function ReportPrintActions() {
  return (
    <div className="report-no-print">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0073E3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0062c2]"
      >
        <Printer className="h-5 w-5" aria-hidden />
        Print / Save as PDF
      </button>
    </div>
  );
}
