"use client";



import { CircleMinus } from "lucide-react";
import {
  ANCAP_SAFETY_RATINGS_LINK_LABEL,
  ANCAP_SAFETY_RATINGS_URL,
  VEHICLE_RECALLS_GOV_AU_URL,
  insightToneClass,
  type ReportInsight,
  type ReportInsightLineVariant,
  reportInsightCopy,
} from "@/lib/report-design";
import { InsightCategoryIcon } from "./ReportInsightIcon";

const RIDE_SHARE_ORANGE = "#E87722";

function insightDetailUsesOrange(id: ReportInsight["id"]): boolean {
  return id === "servicing-guidelines" || id === "warranty-status";
}

function rideShareLineClass(variant: ReportInsightLineVariant): string {
  switch (variant) {
    case "eligible":
      return "text-xs font-normal leading-snug text-emerald-600";
    case "action":
      return "text-xs font-normal leading-snug text-left";
    case "ineligible":
      return "text-xs font-normal leading-snug text-amber-600";
    default:
      return "text-[11px] font-normal leading-snug text-slate-500";
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

  if (tone === "muted") {
    return (
      <CircleMinus
        className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400"
        aria-hidden
      />
    );
  }

  if (tone === "warn") {

    return (

      <span
        className="inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-red-500 text-[8px] font-black leading-none text-white"
        aria-hidden
      >
        !
      </span>

    );

  }

  return (

    <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden />

  );

}



function insightFootnote(insight: ReportInsight): string | undefined {
  if (insight.id === "registration") return undefined;
  const detail = insight.detail?.trim();
  if (!detail) return undefined;
  if (
    (insight.id === "servicing-guidelines" || insight.id === "warranty-status") &&
    !insight.status?.trim()
  ) {
    return undefined;
  }
  const sub = insight.statusSubtext?.trim();
  if (sub && detail === sub) return undefined;
  return detail;
}

export function ReportInsightCard({ insight }: { insight: ReportInsight }) {
  const note = insightFootnote(insight);



  return (

    <div className="report-insight-card flex h-full min-h-[104px] min-w-0 max-w-full flex-col gap-3 overflow-visible rounded-xl border border-slate-200 bg-slate-100 p-3.5 sm:p-4 [hyphens:none] [&_*]:[hyphens:none] [&_a]:[overflow-wrap:break-word] [&_li:not(.report-insight-card-title)]:min-w-0 [&_li:not(.report-insight-card-title)]:hyphens-none [&_li:not(.report-insight-card-title)]:[overflow-wrap:normal] [&_li:not(.report-insight-card-title)]:[word-break:normal] [&_p:not(.report-insight-card-title)]:min-w-0 [&_p:not(.report-insight-card-title)]:hyphens-none [&_p:not(.report-insight-card-title)]:[overflow-wrap:normal] [&_p:not(.report-insight-card-title)]:[word-break:normal]">

      <div className="flex items-start justify-between gap-2">

        <InsightCategoryIcon

          insightId={insight.id}

          className="h-5 w-5 shrink-0 text-slate-700"

        />

        <p className="report-insight-card-title flex-1 text-right text-xs font-bold uppercase leading-snug text-slate-900 [hyphens:none] [overflow-wrap:normal] [word-break:normal]">

          {insight.title}

        </p>

      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col">

        {insight.lines?.length ? (
          <div className="space-y-1 text-left">
            {insight.lines.map((line) => (
              <p
                key={line.text}
                className={`min-w-0 [overflow-wrap:normal] [word-break:normal] ${rideShareLineClass(line.variant)} [hyphens:none]`}
                style={
                  line.variant === "action"
                    ? { color: RIDE_SHARE_ORANGE }
                    : undefined
                }
              >
                {reportInsightCopy(line.text)}
              </p>
            ))}
                {insight.detail ? (
              <p className="pt-0.5 text-[11px] font-normal text-slate-500 [hyphens:none]">
                {reportInsightCopy(insight.detail)}
              </p>
            ) : null}
          </div>
        ) : (
          <>
            <div className="flex items-start gap-1.5">
              {!(
                insightDetailUsesOrange(insight.id) && !insight.status?.trim()
              ) ? (
                <InsightStatusBadge tone={insight.tone} />
              ) : null}
              <div className="min-w-0 flex-1">
                {insight.id === "ancap" && !insight.status?.trim() ? (
                  <div className="min-w-0 space-y-1 text-[11px] font-medium leading-snug [hyphens:none]">
                    <p className="text-[#E87722] [overflow-wrap:anywhere]">
                      {reportInsightCopy("Verify ANCAP rating here:")}
                    </p>
                    <a
                      href={ANCAP_SAFETY_RATINGS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block font-semibold text-[#0073E3] underline underline-offset-2 [overflow-wrap:anywhere]"
                    >
                      {ANCAP_SAFETY_RATINGS_LINK_LABEL}
                    </a>
                  </div>
                ) : insight.status?.trim() ? (
                <p
                  className={`text-xs font-normal leading-snug ${insightToneClass(insight.tone)} ${
                    insight.id === "registration" ? "whitespace-nowrap" : ""
                  }`}
                >
                  {reportInsightCopy(insight.status)}
                </p>
                ) : insight.detail ? (
                  <p
                    className={`min-w-0 text-[11px] font-normal leading-relaxed [overflow-wrap:normal] [word-break:normal] ${
                      insightDetailUsesOrange(insight.id)
                        ? "font-medium text-[#E87722]"
                        : "text-slate-600"
                    }`}
                  >
                    {reportInsightCopy(insight.detail)}
                  </p>
                ) : null}
                {insight.statusSubtext ? (
                  <p
                    className={`mt-1 text-[11px] font-normal leading-snug ${
                      insight.id === "registration" || insight.id === "market"
                        ? insightToneClass(insight.tone)
                        : "text-slate-500"
                    }`}
                  >
                    {reportInsightCopy(insight.statusSubtext)}
                  </p>
                ) : null}
                {insight.listItems?.length && insight.id !== "odometer" ? (
                  <ul className="mt-1.5 space-y-0.5 text-[11px] leading-snug text-slate-600">
                    {insight.listItems.map((item) => (
                      <li key={item}>
                        {reportInsightCopy(item)}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {insight.id === "registration" && insight.detail ? (
                  <p
                    className={`mt-1 text-[11px] font-normal leading-snug ${insightToneClass(insight.tone)}`}
                  >
                    {reportInsightCopy(insight.detail)}
                  </p>
                ) : null}
                {insight.id === "recall" &&
                !insight.status?.trim() &&
                insight.tone === "muted" ? (
                  <p className="mt-0 min-w-0 text-[11px] font-normal leading-relaxed [hyphens:none]">
                    <span className="font-medium text-[#E87722]">
                      Check for recall updates on{" "}
                    </span>
                    <a
                      href={VEHICLE_RECALLS_GOV_AU_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#0073E3] underline underline-offset-2 [overflow-wrap:anywhere]"
                    >
                      www.vehiclerecalls.gov.au
                    </a>
                  </p>
                ) : null}
              </div>
            </div>
            {note &&
              !(
                insight.id === "recall" &&
                !insight.status?.trim() &&
                insight.tone === "muted"
              ) ? (
              <p
                className={`mt-1.5 min-w-0 break-words text-[11px] font-normal leading-snug text-left ${
                  insightDetailUsesOrange(insight.id)
                    ? "font-medium text-[#E87722]"
                    : "text-slate-600"
                }`}
              >
                {reportInsightCopy(note)}
              </p>
            ) : null}
          </>
        )}

      </div>

    </div>

  );

}


