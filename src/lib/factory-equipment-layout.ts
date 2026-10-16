import type { VehicleFactoryFeature } from "./types";

/** Equipment/options grid — matches client sample (3 columns). */
export const FACTORY_EQUIPMENT_COLUMNS = 3;

/**
 * Max factory options on one print/PDF sheet (3-column grid, compact rows).
 * Keep in sync with `countVehicleSpecSheets` / `VehicleSpecReportPage` chunking.
 */
export const FACTORY_FEATURES_PER_PRINT_SHEET = 90;

/** First spec PDF page: vehicle data table + options grid below. */
export const PDF_FACTORY_FEATURES_FIRST_PAGE = 36;

/** Options-only continuation pages in server PDF. */
export const PDF_FACTORY_FEATURES_CONTINUATION = 84;

export function chunkItems<T>(items: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0 || items.length === 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

export function factoryEquipmentRows<T>(
  items: T[],
  columns = FACTORY_EQUIPMENT_COLUMNS,
): T[][] {
  return chunkItems(items, columns);
}

export function factoryFeatureCellKey(feature: VehicleFactoryFeature): string {
  return `${feature.code ?? "opt"}-${feature.label}`;
}
