import type { ReactNode } from "react";
import {
  CAR_BUYING_CHECKLIST_INTRO,
  CAR_BUYING_CHECKLIST_ITEMS,
  CAR_BUYING_CHECKLIST_TITLE,
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
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#0073E3] sm:text-3xl">
            {CAR_BUYING_CHECKLIST_TITLE}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {CAR_BUYING_CHECKLIST_INTRO}
          </p>
        </div>

        <ol className="report-checklist-list space-y-4">
          {CAR_BUYING_CHECKLIST_ITEMS.map((item, index) => (
            <li
              key={item.title}
              className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0073E3] text-sm font-extrabold text-white">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.body}</p>
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
            </li>
          ))}
        </ol>

        {trailingContent}
      </div>
    </ReportShell>
  );
}
