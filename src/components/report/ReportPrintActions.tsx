"use client";

import { Download } from "lucide-react";

export function ReportPrintActions({
  /** Sample reports: stable server PDF instead of browser print (avoids clipped photo grids). */
  downloadPdfUrl,
}: {
  downloadPdfUrl?: string;
}) {
  function handleDownload() {
    if (typeof window === "undefined") return;
    if (downloadPdfUrl) {
      window.open(downloadPdfUrl, "_blank", "noopener,noreferrer");
      return;
    }
    window.print();
  }

  return (
    <div className="report-no-print flex w-full min-w-0 flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-center sm:justify-end">
      <button
        type="button"
        onClick={handleDownload}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0073E3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0062c2] sm:w-auto"
      >
        <Download className="h-5 w-5 shrink-0" aria-hidden />
        {downloadPdfUrl ? "Download PDF" : "Download"}
      </button>
      {downloadPdfUrl ? (
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
        >
          Print preview
        </button>
      ) : null}
    </div>
  );
}
