"use client";



import {

  insightToneClass,

  type ReportInsight,

} from "@/lib/report-design";

import { InsightCategoryIcon } from "./ReportInsightIcon";



function InsightStatusBadge({ tone }: { tone: ReportInsight["tone"] }) {

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



function insightFootnote(insight: ReportInsight): string | undefined {
  const detail = insight.detail?.trim();
  if (!detail) return undefined;
  const sub = insight.statusSubtext?.trim();
  if (sub && detail === sub) return undefined;
  return detail;
}

export function ReportInsightCard({ insight }: { insight: ReportInsight }) {
  const note = insightFootnote(insight);



  return (

    <div className="report-insight-card flex min-h-[104px] flex-col gap-3 rounded-xl border border-slate-200 bg-slate-100 p-3.5 sm:p-4">

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

        <div className="flex items-start gap-1.5">

          <InsightStatusBadge tone={insight.tone} />

          <div className="min-w-0">

            <p

              className={`text-xs font-bold leading-snug break-words ${insightToneClass(insight.tone)}`}

            >

              {insight.status}

            </p>

            {insight.statusSubtext && !insight.detail ? (

              <p

                className={`mt-1 text-[11px] leading-snug break-words ${

                  insight.id === "registration" || insight.id === "market"

                    ? `font-bold ${insightToneClass(insight.tone)}`

                    : "font-medium text-slate-500"

                }`}

              >

                {insight.statusSubtext}

              </p>

            ) : null}

          </div>

        </div>

        {note ? (

          <p className="mt-2 text-[11px] leading-relaxed text-slate-600">{note}</p>

        ) : null}

      </div>

    </div>

  );

}


