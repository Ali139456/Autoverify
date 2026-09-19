import Image from "next/image";
import type { ReactNode } from "react";
import { formatReportDate } from "@/lib/report-design";

export function ReportShell({
  reportId,
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
      <header className="report-shell-header flex items-start justify-between gap-6 bg-[#0073E3] px-6 py-5 sm:px-8">
        <div>
          <Image
            src="/logo/logo-inverse.png"
            alt="Auto Verifi"
            width={220}
            height={48}
            className="h-10 w-auto"
          />
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80">
            Past | Present | Future
          </p>
        </div>
        <div className="border-l border-white/25 pl-5 text-right text-[10px] font-semibold uppercase leading-relaxed tracking-wide text-white/90">
          <p>Report ID: {reportId}</p>
          <p>Generated: {formatReportDate(generatedAt)}</p>
          <p>Autoverifi.com.au</p>
        </div>
      </header>

      <div className="report-shell-body px-6 py-8 sm:px-8">{children}</div>

      <footer className="report-shell-footer flex items-center justify-between border-t border-slate-200 px-6 py-4 sm:px-8">
        <Image
          src="/logo/logo-blue-on-white.png"
          alt="Auto Verifi"
          width={140}
          height={30}
          className="h-7 w-auto opacity-90"
        />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          — Autoverifi.com.au{pageLabel ? ` | ${pageLabel}` : ""}
        </p>
      </footer>
    </article>
  );
}
