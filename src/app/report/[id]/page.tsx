import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Lock } from "lucide-react";
import { CarInsightsReport } from "@/components/report/CarInsightsReport";
import { InsightsPlusBodyReport } from "@/components/report/InsightsPlusBodyReport";
import { getReport } from "@/lib/store";
import { hasDamageAnalysis, resolveReportTier, getReportTierConfig } from "@/lib/pricing";
import { getInspectionByReportId } from "@/lib/inspections";

export const metadata: Metadata = {
  title: "Vehicle Report",
  robots: { index: false },
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReport(id);
  if (!report) notFound();
  const inspection = await getInspectionByReportId(id);

  const { vehicle } = report;
  const tier = resolveReportTier(report.tier);
  const tierConfig = getReportTierConfig(tier);
  const includesDamage = hasDamageAnalysis(tier);
  const pageCount = includesDamage ? 2 : 1;

  if (report.status !== "paid") {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <Lock className="mx-auto h-10 w-10 text-slate-500" aria-hidden />
        <h1 className="mt-4 text-2xl font-bold text-white">
          This report hasn&apos;t been unlocked yet
        </h1>
        <p className="mt-2 text-slate-400">
          Complete payment to view the full report for {vehicle.rego} (
          {vehicle.state}).
        </p>
        <Link
          href={`/check?rego=${vehicle.rego}&state=${vehicle.state}`}
          className="mt-8 inline-block rounded-xl bg-accent-600 px-6 py-3 font-bold text-white hover:bg-accent-500"
        >
          Complete purchase
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {tierConfig.name}
            </p>
            <h1 className="text-xl font-bold text-slate-900">Your vehicle report</h1>
          </div>
          <a
            href={`/api/report/${report.id}/pdf`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0073E3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0062c2]"
          >
            <Download className="h-5 w-5" aria-hidden />
            Download PDF
          </a>
        </div>

        <CarInsightsReport
          report={report}
          showUpgrade={!includesDamage}
          pageLabel={`1 / ${pageCount}`}
        />

        {includesDamage && (
          <InsightsPlusBodyReport
            report={report}
            photos={inspection?.photos ?? []}
            inspectUrl={inspection?.ravinInviteUrl}
            showActions
            pageLabel={`2 / ${pageCount}`}
          />
        )}

        <p className="text-center text-xs leading-relaxed text-slate-500">
          Generated {new Date(report.createdAt).toLocaleString("en-AU")}. This
          report is compiled from third-party data sources and AI models and is
          provided for information only.
        </p>
      </div>
    </div>
  );
}
