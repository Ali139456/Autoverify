export function countVehicleReportPages(
  includesDamage: boolean,
  hasPpsrAppendix: boolean,
  hasVehicleSpecSheet = false,
): number {
  let pages = 1;
  if (hasVehicleSpecSheet) pages += 1;
  if (includesDamage) {
    pages += 1;
  }
  if (includesDamage) pages += 1;
  if (hasPpsrAppendix) pages += 1;
  return pages;
}
