export const PPI_VEHICLE_CATEGORIES = [
  "passenger",
  "commercial",
  "ev",
  "caravan",
  "motorcycle",
] as const;

export type PpiVehicleCategory = (typeof PPI_VEHICLE_CATEGORIES)[number];

const LIST_PRICES_AUD: Record<PpiVehicleCategory, number> = {
  passenger: 290,
  commercial: 290,
  ev: 290,
  caravan: 390,
  motorcycle: 190,
};

export function normalizePpiVehicleCategory(
  raw: unknown,
): PpiVehicleCategory {
  const value = String(raw ?? "passenger").trim().toLowerCase();
  if ((PPI_VEHICLE_CATEGORIES as readonly string[]).includes(value)) {
    return value as PpiVehicleCategory;
  }
  return "passenger";
}

export function listPriceForPpiVehicleCategory(
  category: PpiVehicleCategory,
): number {
  return LIST_PRICES_AUD[category];
}