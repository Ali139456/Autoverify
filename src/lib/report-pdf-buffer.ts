import { createElement, ReactElement } from "react";
import { DocumentProps, renderToBuffer } from "@react-pdf/renderer";
import {
  getInspectionByReportId,
  resolveInspectionPhotoUrls,
} from "./inspections";
import {
  fetchPpsrCertificateForReport,
  hasPpsrCertificate,
  mergePdfBuffers,
} from "./ppsr-certificate";
import { buildSampleInspectionPhotos } from "./build-sample-report";
import {
  buildLavCarSamplePhotos,
  buildLavCarSampleReport,
} from "./lav/build-lav-car-sample";
import { LavReportPdf } from "./lav-report-pdf";
import { ReportPdf } from "./pdf";
import type { InspectionPhoto, VehicleReport } from "./types";

export async function generateReportPdfBuffer(
  report: VehicleReport,
): Promise<Buffer> {
  const inspection = await getInspectionByReportId(report.id);
  let photos: InspectionPhoto[] = await resolveInspectionPhotoUrls(
    inspection?.photos ?? [],
  );
  if (photos.length === 0 && report.id.startsWith("SAMPLE-")) {
    photos = buildSampleInspectionPhotos();
  }

  const isLav =
    report.lavContext?.productKind === "lender_asset_verification";

  const buffer = await renderToBuffer(
    createElement(isLav ? LavReportPdf : ReportPdf, {
      report,
      photos,
    }) as ReactElement<DocumentProps>,
  );
  let output = Buffer.from(buffer);

  if (!isLav && hasPpsrCertificate(report)) {
    const ppsrPdf = await fetchPpsrCertificateForReport(report);
    if (ppsrPdf) {
      output = Buffer.from(await mergePdfBuffers(output, ppsrPdf));
    }
  }

  return output;
}

/** Writes `public/samples/lender-asset-verification-car-sample.pdf` (dev script + tests). */
export async function generateLavCarSamplePdfBuffer(): Promise<Buffer> {
  const report = buildLavCarSampleReport();
  const photos = buildLavCarSamplePhotos();
  const buffer = await renderToBuffer(
    createElement(LavReportPdf, { report, photos }) as ReactElement<DocumentProps>,
  );
  return Buffer.from(buffer);
}
