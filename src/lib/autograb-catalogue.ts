/** AutoGrab asset class — see https://devhub.autograb.com/autograb/asset-classes */
export const AUTOGRAB_ASSET_CATEGORY_LABELS = {
  conventional: "Car / light commercial",
  powersports: "Motorbike or scooter (coming soon)",
  camping: "Caravan or camper (coming soon)",
  heavy_trucks: "Heavy truck (coming soon)",
} as const;

export type AutograbAssetCategory = keyof typeof AUTOGRAB_ASSET_CATEGORY_LABELS;

export const DEFAULT_ASSET_CATEGORY: AutograbAssetCategory = "conventional";

/** Categories customers can purchase a report for today. */
export const PURCHASE_ASSET_CATEGORIES: AutograbAssetCategory[] = [
  "conventional",
];

export const CARS_ONLY_AVAILABILITY_NOTE =
  "Note: Auto Verifi is currently only available for cars (bikes, caravans, trucks and boats are coming soon).";

export const FACET_MANUAL_SELECT_HINT =
  "Please use the drop downs below to select this vehicle from the list.";

const NON_CAR_UPSTREAM =
  /\b(MOTOR\s*CYCLE|MOTORBIKE|MOPED|SCOOTER|TRAILER|CARAVAN|CAMPER|MOTORHOME|TRUCK|PRIME\s*MOVER|BUS|BOAT|JET\s*SKI)\b/i;

export function parseAssetCategory(
  raw?: string | null,
): AutograbAssetCategory {
  if (raw && raw in AUTOGRAB_ASSET_CATEGORY_LABELS) {
    return raw as AutograbAssetCategory;
  }
  return DEFAULT_ASSET_CATEGORY;
}

export function isPurchaseAssetCategory(
  category: AutograbAssetCategory,
): boolean {
  return PURCHASE_ASSET_CATEGORIES.includes(category);
}

export function upstreamIndicatesNonCarAsset(
  upstream?: string | null,
): boolean {
  if (!upstream?.trim()) return false;
  return NON_CAR_UPSTREAM.test(upstream.toUpperCase());
}

export function buildRegistrationLookupQuery(
  state: string,
  options: {
    category?: AutograbAssetCategory;
    features: string;
  },
): string {
  const params = new URLSearchParams({
    region: "au",
    state,
    features: options.features,
    category: options.category ?? DEFAULT_ASSET_CATEGORY,
  });
  return params.toString();
}

export function buildVinLookupQuery(options: {
  category?: AutograbAssetCategory;
  features: string;
}): string {
  const params = new URLSearchParams({
    region: "au",
    features: options.features,
    category: options.category ?? DEFAULT_ASSET_CATEGORY,
  });
  return params.toString();
}
