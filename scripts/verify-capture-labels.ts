import {
  formatInspectionPhotoTileLabel,
  getInspectionAngleLabel,
  getInspectionAngleLabelForReport,
  INSPECTION_ANGLES,
  LAV_DIGITAL_INSPECTION_ANGLES,
} from "../src/lib/inspection-angles";

const mockLavReport = { lavContext: { lenderName: "Test" } };
import { buildSampleInspectionPhotos } from "../src/lib/build-sample-report";
import {
  buildLavCarSamplePhotos,
  buildLavCarSampleReport,
} from "../src/lib/lav/build-lav-car-sample";
import { buildLavReportViewModel } from "../src/lib/lav/lav-report-view";

let failed = 0;

for (const { id, label } of INSPECTION_ANGLES) {
  const got = getInspectionAngleLabel(id);
  if (got !== label) {
    console.error(`Insights+ ${id}: expected "${label}", got "${got}"`);
    failed++;
  }
}

for (const { id, label } of LAV_DIGITAL_INSPECTION_ANGLES) {
  const got = getInspectionAngleLabelForReport(id, mockLavReport);
  if (got !== label) {
    console.error(`LAV ${id}: expected "${label}", got "${got}"`);
    failed++;
  }
}

const star = formatInspectionPhotoTileLabel("Registration papers", "service_record");
if (star !== "Registration papers*") {
  console.error(`Record-only star: got "${star}"`);
  failed++;
}

for (const photo of buildSampleInspectionPhotos()) {
  const expected = getInspectionAngleLabel(photo.angle);
  if (photo.label !== expected) {
    console.error(`Sample photo ${photo.angle}: stored "${photo.label}" !== "${expected}"`);
    failed++;
  }
}

for (const photo of buildLavCarSamplePhotos()) {
  const expected = getInspectionAngleLabelForReport(photo.angle, mockLavReport);
  if (photo.label !== expected) {
    console.error(`LAV sample photo ${photo.angle}: stored "${photo.label}" !== "${expected}"`);
    failed++;
  }
}

const lavReport = buildLavCarSampleReport();
const lavPhotos = buildLavCarSamplePhotos();
const lavVm = buildLavReportViewModel(lavReport, lavPhotos, null);
for (const slot of [...lavVm.walkaround, ...lavVm.identification]) {
  const expected = formatInspectionPhotoTileLabel(
    getInspectionAngleLabelForReport(slot.angleId, lavReport),
    slot.angleId,
  );
  if (slot.title !== expected) {
    console.error(
      `LAV report slot ${slot.angleId}: title "${slot.title}" !== "${expected}"`,
    );
    failed++;
  }
}

if (failed === 0) {
  console.log(
    `OK — ${INSPECTION_ANGLES.length} Insights+ angles, ${LAV_DIGITAL_INSPECTION_ANGLES.length} LAV angles, sample report photos aligned.`,
  );
} else {
  process.exit(1);
}