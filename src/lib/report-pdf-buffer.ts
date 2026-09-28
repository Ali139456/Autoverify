import { createElement, ReactElement } from "react";
import { DocumentProps, renderToBuffer } from "@react-pdf/renderer";
import { getInspectionByReportId } from "./inspections";
import {
  fetchPpsrCertificateForReport,
  hasPpsrCertificate,
  mergePdfBuffers,
} from "./ppsr-certificate";
import { buildSampleInspectionPhotos } from "./build-sample-report";
import { ReportPdf } from "./pdf";
import type { InspectionPhoto, VehicleReport } from "./types";

export async function generateReportPdfBuffer(
  report: VehicleReport,
): Promise<Buffer> {
  const inspection = await getInspectionByReportId(report.id);
  let photos: InspectionPhoto[] = inspection?.photos ?? [];
  if (photos.length === 0 && report.id.startsWith("SAMPLE-")) {
    photos = buildSampleInspectionPhotos();
  }
  const buffer = await renderToBuffer(
    createElement(ReportPdf, {
      report,
      photos,
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
