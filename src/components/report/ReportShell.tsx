import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { formatReportDate } from "@/lib/report-design";

export function ReportShell({
  generatedAt,
  pageLabel,
  children,
}: {
  reportId: string;
  generatedAt: string;
  pageLabel?: string;
  children: ReactNode;
}) {
  return (
    <article className="report-shell overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
      <header className="report-shell-header border-b-2 border-[#0073E3] bg-white px-6 py-5 sm:px-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <Logo height={44} linked={false} />
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#0073E3]">
              Past | Present | Future
            </p>
          </div>
          <div className="text-right text-[10px] font-semibold uppercase leading-relaxed tracking-wide text-slate-500">
            <p>Generated: {formatReportDate(generatedAt)}</p>
            <p>Autoverifi.com.au</p>
          </div>
        </div>
      </header>

      <div className="report-shell-body px-6 py-8 sm:px-8">{children}</div>

      <footer className="report-shell-footer flex items-center justify-between border-t border-slate-200 px-6 py-4 sm:px-8">
        <Logo height={52} linked={false} />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          — Autoverifi.com.au{pageLabel ? ` | ${pageLabel}` : ""}
        </p>
      </footer>
    </article>
  );
}
