import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { formatReportDate } from "@/lib/report-design";

export function ReportShell({
  generatedAt,
  pageLabel,
  reportReference,
  className,
  children,
}: {
  reportId: string;
  generatedAt: string;
  pageLabel?: string;
  reportReference?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      className={`report-shell flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 ${className ?? ""}`}
    >
      <header className="report-shell-header border-b-2 border-[#0073E3] bg-white px-6 py-5 sm:px-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 flex-col items-start">
            <Logo height={52} linked={false} variant="onLight" />
            <p className="mt-1 w-full text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#0073E3]">
              Past | Present | Future Vehicle Insights
            </p>
          </div>
          <div className="text-right text-[10px] font-semibold uppercase leading-relaxed tracking-wide text-slate-500">
            <p>Generated: {formatReportDate(generatedAt)}</p>
            {reportReference ? <p>Report ref: {reportReference}</p> : null}
            <p>Autoverifi.com.au</p>
          </div>
        </div>
      </header>

      <div className="report-shell-body flex min-h-0 flex-1 flex-col px-6 py-8 sm:px-8">
        {children}
      </div>

      <footer className="report-shell-footer mt-auto flex shrink-0 items-center justify-between gap-4 border-t border-slate-200 px-6 py-4 sm:px-8">
        <Logo height={34} linked={false} variant="onLight" />
        <p className="text-right text-xs font-medium uppercase tracking-wide text-slate-400">
          {reportReference ? (
            <>
              {reportReference}
              <span aria-hidden> · </span>
            </>
          ) : null}
          Autoverifi.com.au{pageLabel ? ` | ${pageLabel}` : ""}
        </p>
      </footer>
    </article>
  );
}
