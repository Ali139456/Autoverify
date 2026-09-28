import { createElement, ReactElement } from "react";
import { DocumentProps, renderToBuffer } from "@react-pdf/renderer";
import { getInspectionByReportId } from "./inspections";
import {
  fetchPpsrCertificateForReport,
  hasPpsrCertificate,
  mergePdfBuffers,
} from "./ppsr-certificate";
import { ReportPdf } from "./pdf";
import type { VehicleReport } from "./types";

export async function generateReportPdfBuffer(
  report: VehicleReport,
): Promise<Buffer> {
  const inspection = await getInspectionByReportId(report.id);
  const buffer = await renderToBuffer(
    createElement(ReportPdf, {
      report,
      photos: inspection?.photos ?? [],
    }) as ReactElement<DocumentProps>,
  );
  let output = Buffer.from(buffer);

  if (hasPpsrCertificate(report)) {
    const ppsrPdf = await fetchPpsrCertificateForReport(report);
    if (ppsrPdf) {
      output = Buffer.from(await mergePdfBuffers(output, ppsrPdf));
    }
  }

  return output;
}
