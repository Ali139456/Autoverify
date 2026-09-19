import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Car,
  ChevronRight,
  CircleGauge,
  FileText,
  MapPin,
  Settings2,
  Sparkles,
} from "lucide-react";
import {
  buildKeyInsights,
  buildStatusChecks,
  insightToneClass,
} from "@/lib/report-design";
import type { VehicleReport } from "@/lib/types";
import { ReportShell } from "./ReportShell";

const SPEC_ICONS = [Car, Settings2, Sparkles, Calendar, MapPin, CircleGauge] as const;

function StatusIcon({ ok }: { ok: boolean }) {
  return (
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
        ok ? "bg-emerald-500" : "bg-slate-300"
      }`}
      aria-hidden
    >
      ✓
    </span>
  );
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
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Auto Verifi – Car Insights Report
          </h1>
          <p className="mt-2 text-lg font-bold text-[#0073E3]">{vehicleTitle}</p>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            A comprehensive summary of your vehicle&apos;s history, status and key
            insights.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:grid-cols-3 lg:grid-cols-6">
          {specs.map(({ label, value }, i) => {
            const Icon = SPEC_ICONS[i] ?? Car;
            return (
              <div key={label} className="min-w-0">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="text-[10px] font-bold uppercase tracking-wide">
                    {label}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-bold text-slate-900">{value}</p>
              </div>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
          <div className="grid lg:grid-cols-[1fr_280px]">
            <div className="p-6 sm:p-8">
              <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Vehicle Status
              </h2>
              <ul className="mt-5 space-y-3">
                {statusChecks.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <StatusIcon ok={item.ok} />
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative min-h-[200px] bg-slate-100 lg:min-h-full">
              <Image
                src="/hero-car.png"
                alt=""
                fill
                className="object-cover object-center opacity-90"
                sizes="280px"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-sm font-extrabold uppercase tracking-[0.16em] text-slate-900">
              Key Insights
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0073E3]">
              All the essentials. In one place.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="flex min-h-[88px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-semibold text-slate-500">{insight.title}</p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p
                    className={`text-sm font-bold leading-snug ${insightToneClass(insight.tone)}`}
                  >
                    {insight.status}
                  </p>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" aria-hidden />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
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
          <div className="flex flex-col items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-8 w-8 text-[#0073E3]" aria-hidden />
              <div>
                <p className="font-bold text-slate-900">
                  Upgrade to Auto Verifi Insights+ for AI powered damage detection
                  and more insights.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Guided photo walkaround, Ravin AI damage analysis and expert phone
                  support.
                </p>
              </div>
            </div>
            <Link
              href={`/check?rego=${vehicle.rego}&state=${vehicle.state}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#0073E3] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0062c2]"
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
