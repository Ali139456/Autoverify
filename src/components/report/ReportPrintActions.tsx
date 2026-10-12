"use client";

import { Download } from "lucide-react";

export function ReportPrintActions() {
  function handleDownload() {
    if (typeof window === "undefined") return;
    window.print();
  }

  return (
    <div className="report-no-print flex w-full min-w-0 flex-col sm:ml-auto sm:w-auto sm:flex-row sm:items-center sm:justify-end">
      <button
        type="button"
        onClick={handleDownload}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0073E3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0062c2] sm:w-auto"
      >
        <Download className="h-5 w-5 shrink-0" aria-hidden />
        Download
      </button>
    </div>
  );
}
