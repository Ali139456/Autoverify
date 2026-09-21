"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  insightToneClass,
  type InsightStatus,
  type ReportInsight,
} from "@/lib/report-design";
import { InsightCategoryIcon } from "./ReportInsightIcon";

function InsightStatusBadge({ tone }: { tone: InsightStatus }) {
  if (tone === "info") {
    return (
      <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-sky-500" aria-hidden />
    );
  }
  if (tone === "neutral") {
    return (
      <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-amber-500" aria-hidden />
    );
  }
  if (tone === "warn") {
    return (
      <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />
    );
  }
  return (
    <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />
  );
}

export function ReportInsightCard({ insight }: { insight: ReportInsight }) {
  const [open, setOpen] = useState(false);
  const hasDetail = Boolean(insight.detail);

  return (
    <div className="report-insight-card flex min-h-[104px] flex-col justify-between rounded-xl border border-slate-200 bg-slate-100 p-3.5 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <InsightCategoryIcon
          insightId={insight.id}
          className="h-5 w-5 shrink-0 text-slate-700"
        />
        <p className="flex-1 text-right text-[10px] font-semibold uppercase leading-snug text-slate-500">
          {insight.title}
        </p>
      </div>
      <div className="mt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-1.5">
            <InsightStatusBadge tone={insight.tone} />
            <div className="min-w-0">
              <p
                className={`text-xs font-bold leading-snug break-words ${insightToneClass(insight.tone)}`}
              >
                {insight.status}
              </p>
              {insight.statusSubtext ? (
                <p
                  className={`mt-1 text-[11px] leading-snug break-words ${
                    insight.id === "registration"
                      ? `font-bold ${insightToneClass(insight.tone)}`
                      : "font-medium text-slate-500"
                  }`}
                >
                  {insight.statusSubtext}
                </p>
              ) : null}
            </div>
          </div>
          {hasDetail ? (
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-label={`More information about ${insight.title}`}
              className="report-insight-chevron mt-0.5 shrink-0 rounded p-0.5 text-slate-400 transition hover:text-accent-600"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
                aria-hidden
              />
            </button>
          ) : (
            <ChevronRight
              className="report-insight-chevron mt-0.5 h-4 w-4 shrink-0 text-slate-300"
              aria-hidden
            />
          )}
        </div>
        {open && insight.detail ? (
          <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
            {insight.detail}
          </p>
        ) : null}
      </div>
    </div>
  );
}
