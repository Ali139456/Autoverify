import type { ValuationInfo } from "@/lib/types";

const ROWS = [
  ["Trade-in", "tradeLow", "tradeHigh"],
  ["Private sale", "privateLow", "privateHigh"],
  ["Dealer retail", "retailLow", "retailHigh"],
] as const;

export function lavValuationHasData(
  valuation: ValuationInfo | null | undefined,
): boolean {
  if (!valuation) return false;
  return ROWS.some(([, low, high]) => {
    const lo = valuation[low];
    const hi = valuation[high];
    return Number(lo) > 0 && Number(hi) > 0;
  });
}

export function lavValuationRows(
  valuation: ValuationInfo,
): { label: string; low: number; high: number }[] {
  return ROWS.map(([label, lowKey, highKey]) => ({
    label,
    low: valuation[lowKey],
    high: valuation[highKey],
  })).filter((row) => row.low > 0 && row.high > 0);
}

export function formatLavValuationRange(low: number, high: number): string {
  const fmt = (n: number) =>
    `$${n.toLocaleString("en-AU", { maximumFractionDigits: 0 })}`;
  return `${fmt(low)} – ${fmt(high)}`;
}
