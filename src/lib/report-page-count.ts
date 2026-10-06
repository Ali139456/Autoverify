export function countVehicleReportPages(
  includesDamage: boolean,
  hasPpsrAppendix: boolean,
  hasVehicleSpecSheet = false,
): number {
  let pages = 1; // Overview (status, key insights, warranty)
  pages += 1; // Present/future value + valuation supplements (always separate for print)
  if (hasVehicleSpecSheet) pages += 1;
  if (includesDamage) pages += 1; // Insights+ condition / photos
  if (hasPpsrAppendix) pages += 1;
  return pages;
}
