export type PromoCodeDefinition = {
  code: string;
  percentOff: number;
  label: string;
};

/** Denise promo codes for Insights and Insights+ (amounts inc. GST). */
const PROMO_CODES: PromoCodeDefinition[] = [
  { code: "AVFREE", percentOff: 100, label: "Free" },
  { code: "AVCLUB", percentOff: 10, label: "10% off" },
];

export function normalizePromoCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function lookupPromoCode(raw: string): PromoCodeDefinition | null {
  const normalized = normalizePromoCode(raw);
  if (!normalized) return null;
  return PROMO_CODES.find((entry) => entry.code === normalized) ?? null;
}

export function applyPercentDiscount(
  priceCents: number,
  percentOff: number,
): number {
  return Math.max(0, Math.round((priceCents * (100 - percentOff)) / 100));
}

export function listKnownPromoCodes(): string[] {
  return PROMO_CODES.map((entry) => entry.code);
}
