import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Info,
  MinusCircle,
} from "lucide-react";
import {
  buildKeyInsights,
  buildStatusChecks,
  insightToneClass,
  type InsightStatus,
} from "@/lib/report-design";
import type { VehicleReport } from "@/lib/types";
import { InsightCategoryIcon, SpecIcon } from "./ReportInsightIcon";
import { ReportShell } from "./ReportShell";

function StatusIcon({ ok }: { ok: boolean }) {
  return (
    <CheckCircle2
      className={`mt-0.5 h-5 w-5 shrink-0 ${ok ? "text-emerald-500" : "text-slate-300"}`}
      aria-hidden
    />
  );
}

function InsightStatusBadge({ tone }: { tone: InsightStatus }) {
  if (tone === "info") {
    return <Info className="h-4 w-4 shrink-0 text-sky-500" aria-hidden />;
  }
  if (tone === "neutral") {
    return <MinusCircle className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />;
  }
  if (tone === "warn") {
    return <MinusCircle className="h-4 w-4 shrink-0 text-red-500" aria-hidden />;
  }
  return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden />;
}

export function CarInsightsReport({
  report,
  showUpgrade,
  pageLabel = "1 / 2",
}: {
  report: VehicleReport;
  showUpgrade: boolean;
  pageLabel?: string;
}) {
  const { vehicle, valuation } = report;
  const statusChecks = buildStatusChecks(report);
  const insights = buildKeyInsights(report);

  const specs = [
    { label: "Make", value: vehicle.make },
    { label: "Model", value: vehicle.model },
    { label: "Badge", value: vehicle.variant || "—" },
    { label: "Year", value: String(vehicle.year) },
    { label: "VIN", value: vehicle.vin || "—" },
    {
      label: "Odometer",
      value: vehicle.odometer ? `${vehicle.odometer.toLocaleString()} km` : "—",
    },
  ];

  const vehicleTitle = `${vehicle.make} ${vehicle.model} ${vehicle.variant} ${vehicle.year}`.trim();

  return (
    <ReportShell
      reportId={report.id}
      generatedAt={report.createdAt}
      pageLabel={pageLabel}
    >
      <div className="report-body space-y-8">
        <div className="report-title-block">
          <h1 className="report-main-title text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Auto Verifi – Car Insights Report
          </h1>
          <p className="report-vehicle-title mt-2 text-lg font-bold text-[#0073E3]">{vehicleTitle}</p>
          <p className="report-subtitle mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            A comprehensive summary of your vehicle&apos;s history, status and key
            insights.
          </p>
        </div>

        <div className="report-spec-bar grid grid-cols-2 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50 sm:grid-cols-3 lg:grid-cols-6">
          {specs.map(({ label, value }, i) => (
            <div key={label} className="min-w-0 px-4 py-3 first:pl-4">
              <div className="flex items-center gap-1.5 text-slate-500">
                <SpecIcon index={i} className="h-4 w-4 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wide">
                  {label}
                </span>
              </div>
              <p className="report-spec-value mt-1.5 break-all text-sm font-bold text-slate-900">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="report-status-panel overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="report-status-grid grid lg:grid-cols-[1fr_300px]">
            <div className="report-status-list border-b border-slate-200 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Vehicle Status
              </h2>
              <ul className="report-status-items mt-5 space-y-3">
                {statusChecks.map((item) => (
                  <li key={item.label} className="flex items-start gap-2">
                    <StatusIcon ok={item.ok} />
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="report-hero-image relative min-h-[220px] bg-slate-900">
              <Image
                src="/hero-car.png"
                alt={`${vehicleTitle} illustration`}
                fill
                className="object-cover object-center"
                sizes="300px"
                priority
              />
            </div>
          </div>
        </div>

        <div className="report-insights-section">
          <div className="report-insights-header mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-slate-900">
              Key Insights
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0073E3]">
              All the essentials. In one place.
            </p>
          </div>
          <div className="report-insights-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="report-insight-card flex min-h-[104px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <InsightCategoryIcon
                    insightId={insight.id}
                    className="h-5 w-5 shrink-0 text-slate-700"
                  />
                  <p className="flex-1 text-right text-[10px] font-semibold uppercase leading-snug text-slate-500">
                    {insight.title}
                  </p>
                </div>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-1.5">
                    <InsightStatusBadge tone={insight.tone} />
                    <p
                      className={`text-xs font-bold leading-snug break-words ${insightToneClass(insight.tone)}`}
                    >
                      {insight.status}
                    </p>
                  </div>
                  <ChevronRight
                    className="report-insight-chevron mt-0.5 h-4 w-4 shrink-0 text-slate-300"
                    aria-hidden
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-supplementary rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Market valuation ({valuation.confidence} confidence)
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {[
              ["Trade-in", valuation.tradeLow, valuation.tradeHigh],
              ["Private sale", valuation.privateLow, valuation.privateHigh],
              ["Dealer retail", valuation.retailLow, valuation.retailHigh],
            ].map(([label, low, high]) => (
              <div key={label as string} className="rounded-lg bg-white p-4 ring-1 ring-slate-200">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-base font-extrabold text-[#0073E3]">
                  ${(low as number).toLocaleString("en-AU")} – $
                  {(high as number).toLocaleString("en-AU")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {showUpgrade && (
          <div className="report-upgrade-banner flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-8 w-8 shrink-0 text-[#0073E3]" aria-hidden />
              <div>
                <p className="font-bold text-slate-900">
                  Upgrade to Auto Verifi Insights+ for AI powered damage detection
                  and more insights.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Get detailed condition analysis, image-based damage detection,
                  variant verification and market valuation.
                </p>
              </div>
            </div>
            <Link
              href={`/check?rego=${vehicle.rego}&state=${vehicle.state}`}
              className="report-no-print-link inline-flex shrink-0 items-center gap-2 rounded-full bg-[#0073E3] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0062c2]"
            >
              View upgrade options
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        )}
      </div>
    </ReportShell>
  );
}
