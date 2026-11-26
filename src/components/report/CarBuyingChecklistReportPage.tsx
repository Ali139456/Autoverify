import type { ReactNode } from "react";
import {
  NEXT_STEPS_TO_PURCHASE_ITEMS,
  NEXT_STEPS_TO_PURCHASE_TITLE,
} from "@/lib/car-buying-checklist";
import { formatReportReference } from "@/lib/report-design";
import type { VehicleReport } from "@/lib/types";
import { ReportShell } from "./ReportShell";

export function CarBuyingChecklistReportPage({
  report,
  pageLabel,
  trailingContent,
}: {
  report: VehicleReport;
  pageLabel: string;
  /** Rendered at the end of the page body (e.g. the general disclaimer). */
  trailingContent?: ReactNode;
}) {
  return (
    <ReportShell
      reportId={report.id}
      generatedAt={report.createdAt}
      reportReference={formatReportReference(report.vehicle)}
      pageLabel={pageLabel}
      className="report-shell-checklist"
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {NEXT_STEPS_TO_PURCHASE_TITLE}
        </h1>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {NEXT_STEPS_TO_PURCHASE_ITEMS.map((item, index) => (
            <div
              key={item.title}
              className={`px-5 py-4 ${
                index < NEXT_STEPS_TO_PURCHASE_ITEMS.length - 1
                  ? "border-b border-slate-200"
                  : ""
              }`}
            >
              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {item.body}
              </p>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-[#0073E3] underline underline-offset-2 hover:text-[#0062c2]"
                >
                  {item.linkLabel ?? item.href}
                </a>
              ) : null}
            </div>
          ))}
        </div>

        {trailingContent}
      </div>
    </ReportShell>
  );
}