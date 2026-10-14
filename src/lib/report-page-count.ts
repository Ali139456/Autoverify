export const KEY_INSIGHTS_PER_SHEET = 4;

export function countKeyInsightSheets(insightCount: number): number {
  return Math.max(1, Math.ceil(insightCount / KEY_INSIGHTS_PER_SHEET));
}

/** Extra full pages after page 1 (overview + first row of insights). Remainder shares one sheet. */
export function countKeyInsightContinuationSheets(insightCount: number): number {
  return insightCount > KEY_INSIGHTS_PER_SHEET ? 1 : 0;
}

import { PPSR_CERTIFICATE_SHEET_COUNT } from "./ppsr-certificate-public";

export function countVehicleReportPages(
  includesDamage: boolean,
  hasPpsrAppendix: boolean,
  hasVehicleSpecSheet = false,
  _hasFactoryFeatures = false,
  _hasAdditionalInspectionPhotos = true,
  keyInsightCount = KEY_INSIGHTS_PER_SHEET,
): number {
  let pages = 1; // Overview + all key insights + warranty (one sheet)
  pages += 2; // Valuations + market data; P-plate & ride-share
  if (hasVehicleSpecSheet) pages += 1;
  if (includesDamage) {
    pages += 2; // All inspection photos + damage
  }
  pages += 1; // Car buying checklist + general disclaimer
  if (hasPpsrAppendix) pages += PPSR_CERTIFICATE_SHEET_COUNT;
  return pages;
}
