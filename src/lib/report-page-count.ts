export const KEY_INSIGHTS_PER_SHEET = 4;

export function countKeyInsightSheets(insightCount: number): number {
  return Math.max(1, Math.ceil(insightCount / KEY_INSIGHTS_PER_SHEET));
}

/** Extra full pages after page 1 (overview + first row of insights). Remainder shares one sheet. */
export function countKeyInsightContinuationSheets(insightCount: number): number {
  return insightCount > KEY_INSIGHTS_PER_SHEET ? 1 : 0;
}

import { PPSR_CERTIFICATE_SHEET_COUNT } from "./ppsr-certificate-public";

/** Keep in sync with VehicleSpecReportPage factory chunk size (print uses 2 columns — see globals.css). */
export const FACTORY_FEATURES_PER_PRINT_SHEET = 32;

export function countVehicleSpecSheets(
  hasVehicleSpecSheet: boolean,
  factoryFeatureCount: number,
): number {
  if (!hasVehicleSpecSheet) return 0;
  if (factoryFeatureCount <= 0) return 1;
  return 1 + Math.ceil(factoryFeatureCount / FACTORY_FEATURES_PER_PRINT_SHEET);
}

export function countVehicleReportPages(
  includesDamage: boolean,
  hasPpsrAppendix: boolean,
  hasVehicleSpecSheet = false,
  hasFactoryFeatures = false,
  _hasAdditionalInspectionPhotos = true,
  _keyInsightCount?: number,
  factoryFeatureCount = 0,
): number {
  void _keyInsightCount;
  let pages = 1; // Overview + all key insights + warranty (one sheet)
  pages += 2; // Valuations + market data; P-plate & ride-share
  if (hasVehicleSpecSheet) {
    pages += countVehicleSpecSheets(
      true,
      hasFactoryFeatures ? Math.max(factoryFeatureCount, 1) : 0,
    );
  }
  if (includesDamage) {
    pages += 2; // Walkaround photos + damage
    if (_hasAdditionalInspectionPhotos) pages += 1; // Additional photos (wheels, interior, records)
  }
  pages += 1; // Car buying checklist + general disclaimer
  if (hasPpsrAppendix) pages += PPSR_CERTIFICATE_SHEET_COUNT;
  return pages;
}
