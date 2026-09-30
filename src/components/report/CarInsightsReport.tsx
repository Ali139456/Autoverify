import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  XCircle,
} from "lucide-react";
import {
  buildKeyInsights,
  buildStatusChecks,
  futureValueConfidenceLabel,
  getFutureValueAtYears,
  resolveFutureValue,
} from "@/lib/report-design";
import { hasDamageAnalysis, resolveReportTier } from "@/lib/pricing";
import type { VehicleReport } from "@/lib/types";
import { buildCheckSearchUrl } from "@/lib/vehicle-identifier";
import { SpecIcon } from "./ReportInsightIcon";
import { ReportInsightCard } from "./ReportInsightCard";
import { ReportShell } from "./ReportShell";
import { VehicleHeroImage } from "./VehicleHeroImage";

function StatusIcon({
  ok,
  issue,
  muted,
}: {
  ok: boolean;
  issue?: boolean;
  muted?: boolean;
}) {
  if (issue) {
    return (
      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden />
    );
  }
  if (muted) {
    return (
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-slate-300" aria-hidden />
    );
  }
  return (
    <CheckCircle2
      className={`mt-0.5 h-5 w-5 shrink-0 ${ok ? "text-emerald-500" : "text-slate-300"}`}
      aria-hidden
    />
  );
}

function FutureValueBlock({
  futureValue,
  futureHorizons,
}: {
  futureValue: ReturnType<typeof resolveFutureValue>;
  futureHorizons: { label: string; years: number }[];
}) {
  return (
    <div className="report-supplementary report-future-section rounded-xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Future value forecast ({futureValueConfidenceLabel(futureValue)} confidence)
        </h3>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0073E3]">
          Based on {futureValue.yearlyKms.toLocaleString()} km per year
        </p>
      </div>
      <div className="report-future-grid mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {futureHorizons.map(({ label, years }) => {
          const point = getFutureValueAtYears(futureValue, years);
          return (
            <div
              key={label}
              className="rounded-lg bg-white p-4 ring-1 ring-slate-200"
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-base font-extrabold text-[#0073E3]">
                {point ? `$${point.value.toLocaleString("en-AU")}` : "—"}
              </p>
              {point ? (
                <p className="report-future-kms mt-1 text-[10px] text-slate-400">
                  {point.odometer.toLocaleString()} km
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="report-future-note mt-3 text-[10px] leading-relaxed text-slate-400">
        Residual valuations are modelled from market data and assumed annual kilometres.
        Actual future value may differ based on condition, usage and market changes.
      </p>
    </div>
  );
}

function UpgradeBanner({ vehicle }: { vehicle: VehicleReport["vehicle"] }) {
  return (
    <div className="report-upgrade-banner flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 h-8 w-8 shrink-0 text-[#0073E3]" aria-hidden />
        <div>
          <p className="font-bold text-slate-900">
            Upgrade to Auto Verifi Insights+ for AI powered condition scan and more
            insights.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Get AI powered current condition insights of exterior body, tyres and
            interior + predicted future valuation.
          </p>
        </div>
      </div>
      <Link
        href={`${buildCheckSearchUrl(vehicle, { tier: "insights_plus" })}#booking-payment`}
        className="report-no-print-link inline-flex shrink-0 items-center gap-2 rounded-full bg-[#0073E3] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0062c2]"
      >
        View upgrade options
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

export function CarInsightsReport({
  report,
  showUpgrade,
  pageLabel,
  pageLabelFuture,
}: {
  report: VehicleReport;
  showUpgrade: boolean;
  pageLabel: string;
  /** When set with future-value tier, forecast + upgrade render on report page 2. */
  pageLabelFuture?: string;
}) {
  const { vehicle, valuation } = report;
  const showFutureValue = hasDamageAnalysis(resolveReportTier(report.tier));
  const splitFuturePage = showFutureValue && Boolean(pageLabelFuture);
  const statusChecks = buildStatusChecks(report);
  const insights = buildKeyInsights(report);
  const futureValue = resolveFutureValue(report);
  const futureHorizons = [
    { label: "Today", years: 0 },
    { label: "+1 year", years: 1 },
    { label: "+3 years", years: 3 },
    { label: "+5 years", years: 5 },
  ];

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

  const vehicleTitle =
    `${vehicle.make} ${vehicle.model} ${vehicle.variant} ${vehicle.year}`.trim();

  const primaryBody = (
    <div className="report-body space-y-8">
      <div className="report-title-block">
        <h1 className="report-main-title text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Auto Verifi – Vehicle Insights Report
        </h1>
        <p className="report-vehicle-title mt-2 text-lg font-bold text-[#0073E3]">
          {vehicleTitle}
        </p>
        <p className="report-subtitle mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          A comprehensive summary of your vehicle&apos;s history, status and key insights.
        </p>
      </div>

      <div className="report-spec-bar grid grid-cols-2 divide-x divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50 sm:grid-cols-3 lg:grid-cols-6">
        {specs.map(({ label, value }, i) => (
          <div
            key={label}
            className={`min-w-0 px-4 py-3 first:pl-4 ${label === "VIN" ? "col-span-2 lg:col-span-2" : ""}`}
          >
            <div className="flex items-center gap-1.5 text-slate-500">
              <SpecIcon index={i} className="h-4 w-4 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
            </div>
            <p
              className={`report-spec-value mt-1.5 text-sm font-bold text-slate-900 ${
                label === "VIN"
                  ? "whitespace-nowrap font-mono text-xs sm:text-sm"
                  : "break-words"
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="report-status-panel overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <div className="report-status-grid grid lg:grid-cols-[1fr_380px]">
          <div className="report-status-list border-b border-slate-200 p-6 sm:p-8 lg:border-b-0 lg:border-r">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Vehicle Status
            </h2>
            <ul className="report-status-items mt-5 space-y-3">
              {statusChecks.map((item) => (
                <li key={item.label} className="flex items-start gap-2">
                  <StatusIcon ok={item.ok} issue={item.issue} muted={item.muted} />
                  <span
                    className={`text-sm font-medium ${
                      item.issue
                        ? "text-red-600"
                        : item.muted
                          ? "text-slate-400"
                          : "text-slate-700"
                    }`}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <VehicleHeroImage
            vehicle={vehicle}
            vehicleTitle={vehicleTitle}
            className="report-hero-image relative min-h-[240px] bg-slate-950 lg:min-h-[280px]"
          />
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
            <ReportInsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>

      <div className="report-supplementary report-present-value rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Present value — market valuation ({valuation.confidence} confidence)
        </h3>
        <div className="report-valuation-grid mt-3 grid gap-3 sm:grid-cols-3">
          {[
            ["Trade-in", valuation.tradeLow, valuation.tradeHigh],
            ["Private sale", valuation.privateLow, valuation.privateHigh],
            ["Dealer retail", valuation.retailLow, valuation.retailHigh],
          ].map(([label, low, high]) => (
            <div
              key={label as string}
              className="rounded-lg bg-white p-4 ring-1 ring-slate-200"
            >
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-1 text-base font-extrabold text-[#0073E3]">
                ${(low as number).toLocaleString("en-AU")} – $
                {(high as number).toLocaleString("en-AU")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {showFutureValue && !splitFuturePage ? (
        <FutureValueBlock futureValue={futureValue} futureHorizons={futureHorizons} />
      ) : null}

      {showUpgrade && !splitFuturePage ? <UpgradeBanner vehicle={vehicle} /> : null}
    </div>
  );

  return (
    <>
      <ReportShell
        reportId={report.id}
        generatedAt={report.createdAt}
        pageLabel={pageLabel}
        className="report-shell-insights report-shell-insights-page1"
      >
        {primaryBody}
      </ReportShell>

      {splitFuturePage ? (
        <div className="report-page-break report-insights-future-page">
          <ReportShell
            reportId={report.id}
            generatedAt={report.createdAt}
            pageLabel={pageLabelFuture}
            className="report-shell-insights report-shell-insights-page2"
          >
            <div className="report-body space-y-8">
              <FutureValueBlock
                futureValue={futureValue}
                futureHorizons={futureHorizons}
              />
              {showUpgrade ? <UpgradeBanner vehicle={vehicle} /> : null}
            </div>
          </ReportShell>
        </div>
      ) : null}
    </>
  );
}
