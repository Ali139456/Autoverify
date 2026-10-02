import { CarInsightsReport } from "@/components/report/CarInsightsReport";

import { InsightsPlusBodyReport } from "@/components/report/InsightsPlusBodyReport";

import { PresentAndFutureValueReportPage } from "@/components/report/PresentAndFutureValueReportPage";

import { ReportPrintActions } from "@/components/report/ReportPrintActions";

import { PpsrCertificateReportPage } from "@/components/report/PpsrCertificateReportPage";

import { VehicleSpecReportPage } from "@/components/report/VehicleSpecReportPage";

import { hasPpsrCertificate } from "@/lib/ppsr-certificate";

import {

  buildSampleInspectionPhotos,

  buildSampleReport,

} from "@/lib/build-sample-report";

import { countVehicleReportPages } from "@/lib/report-page-count";

import { hasDamageAnalysis } from "@/lib/pricing";

import { hasVehicleSpecContent } from "@/lib/vehicle-spec-sheet";

import type { ReportTier } from "@/lib/types";



export function SampleReportLayout({ tier }: { tier: ReportTier }) {

  const report = buildSampleReport(tier);

  const includesDamage = hasDamageAnalysis(tier);

  const hasSpecAppendix = hasVehicleSpecContent(report.vehicleSpec);

  const hasPpsrAppendix = hasPpsrCertificate(report);

  const pageCount = countVehicleReportPages(

    includesDamage,

    hasSpecAppendix,

    hasPpsrAppendix,

  );

  let reportPage = 1;



  return (

    <div className="report-view min-h-screen bg-slate-100 py-8 sm:py-12">

      <div id="report-print-area" className="mx-auto max-w-5xl space-y-6 px-4 sm:py-0 sm:px-6">

        <div className="report-no-print rounded-xl border border-[#0073E3]/30 bg-[#0073E3]/5 px-4 py-3 text-center text-sm text-slate-700">

          <span className="font-bold text-[#0073E3]">Sample report</span> — illustrative

          data only. Purchase a report for your vehicle&apos;s live checks and valuation.

        </div>



        <div className="report-no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h1 className="text-xl font-bold text-slate-900">

              Past | Present | Future vehicle insights

            </h1>

          </div>

          <ReportPrintActions />

        </div>



        <div className="report-print-page-first">

          <CarInsightsReport

            report={report}

            showUpgrade={false}

            pageLabel={`${reportPage++} / ${pageCount}`}

            deferValuations={includesDamage}

          />

        </div>



        {includesDamage ? (

          <div className="report-page-break report-valuations-page-break">

            <PresentAndFutureValueReportPage

              report={report}

              pageLabel={`${reportPage++} / ${pageCount}`}

            />

          </div>

        ) : null}



        {hasSpecAppendix ? (

          <div className="report-page-break">

            <VehicleSpecReportPage

              report={report}

              pageLabel={`${reportPage++} / ${pageCount}`}

            />

          </div>

        ) : null}



        {includesDamage ? (

          <div className="report-page-break">

            <InsightsPlusBodyReport

              report={report}

              photos={buildSampleInspectionPhotos()}

              showActions={false}

              pageLabel={`${reportPage++} / ${pageCount}`}

            />

          </div>

        ) : null}



        {hasPpsrAppendix ? (

          <div className="report-page-break report-ppsr-page-break">

            <PpsrCertificateReportPage

              report={report}

              pageLabel={`${reportPage++} / ${pageCount}`}

            />

          </div>

        ) : null}



        <p className="report-no-print text-center text-xs leading-relaxed text-slate-500">

          Sample generated for demonstration. Real reports use live PPSR, market and

          valuation data for your vehicle.

        </p>

      </div>

    </div>

  );

}

