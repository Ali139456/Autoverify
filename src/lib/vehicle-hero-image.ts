export const VEHICLE_HERO_IMAGE_DISCLAIMER =
  "Picture provided is a sample only and may not match the exact model, variant or colour of this vehicle.";

export function normalizeColourForStockPhoto(colour: string | null | undefined): string {
  const trimmed = colour?.trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function coloursRoughlyMatch(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const na = a?.trim().toLowerCase();
  const nb = b?.trim().toLowerCase();
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const aliases: Record<string, string[]> = {
    grey: ["gray", "graphite", "charcoal"],
    gray: ["grey", "graphite", "charcoal"],
    silver: ["grey", "gray"],
  };
  for (const [key, values] of Object.entries(aliases)) {
    const set = new Set([key, ...values]);
    if (set.has(na) && set.has(nb)) return true;
  }
  return false;
}

export function buildStockHeroDisclaimer(shownColour?: string | null): string {
  const colour = shownColour?.trim();
  if (colour) {
    return `Picture provided is a sample only (representative image in ${colour}). May not match the exact model or variant of this vehicle.`;
  }
  return VEHICLE_HERO_IMAGE_DISCLAIMER;
}
