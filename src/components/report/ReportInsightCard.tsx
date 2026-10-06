"use client";



import { CheckCircle2 } from "lucide-react";
import {
  ANCAP_SAFETY_RATINGS_URL,
  insightToneClass,
  type ReportInsight,
  type ReportInsightLineVariant,
} from "@/lib/report-design";
import { InsightCategoryIcon } from "./ReportInsightIcon";

const RIDE_SHARE_ORANGE = "#E87722";

function rideShareLineClass(variant: ReportInsightLineVariant): string {
  switch (variant) {
    case "eligible":
      return "text-xs font-bold leading-snug text-emerald-600";
    case "action":
      return "text-xs font-bold leading-snug";
    case "ineligible":
      return "text-xs font-bold leading-snug text-amber-600";
    default:
      return "text-[11px] font-medium leading-snug text-slate-500";
  }
}



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

    <div className="report-insight-card flex min-h-[104px] min-w-0 flex-col gap-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-3.5 sm:p-4">

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

        {insight.lines?.length ? (
          <div className="space-y-1">
            {insight.lines.map((line) =>
              line.variant === "action" ? (
                <p
                  key={line.text}
                  className={`flex flex-wrap items-center gap-1.5 ${rideShareLineClass(line.variant)}`}
                  style={{ color: RIDE_SHARE_ORANGE }}
                >
                  <CheckCircle2
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: RIDE_SHARE_ORANGE }}
                    aria-hidden
                  />
                  {line.text}
                </p>
              ) : (
                <p key={line.text} className={rideShareLineClass(line.variant)}>
                  {line.text}
                </p>
              ),
            )}
            {insight.detail ? (
              <p className="pt-0.5 text-[11px] font-medium text-slate-500">
                {insight.detail}
              </p>
            ) : null}
          </div>
        ) : (
          <>
            <div className="flex items-start gap-1.5">
              <InsightStatusBadge tone={insight.tone} />
              <div className="min-w-0">
                <p
                  className={`text-xs font-bold leading-snug break-words ${
                    insight.id === "odometer" &&
                    insight.status === "No odometer history reported"
                      ? "text-[#E87722]"
                      : insightToneClass(insight.tone)
                  }`}
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
            {insight.id === "ancap" && insight.status === "Not available" ? (
              <p className="mt-2 min-w-0 text-[11px] leading-relaxed break-words text-slate-600">
                Verify ANCAP rating here:{" "}
                <a
                  href={ANCAP_SAFETY_RATINGS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#0073E3] underline underline-offset-2 [overflow-wrap:anywhere]"
                >
                  {ANCAP_SAFETY_RATINGS_URL}
                </a>
              </p>
            ) : note ? (
              <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                {note}
              </p>
            ) : null}
          </>
        )}

      </div>

    </div>

  );

}


