export function countVehicleReportPages(
  includesDamage: boolean,
  hasSpecAppendix: boolean,
  hasPpsrAppendix: boolean,
): number {
  let pages = 1;
  if (includesDamage) {
    pages += 1;
    if (hasSpecAppendix) pages += 1;
  } else if (hasSpecAppendix) {
    pages += 1;
  }
  if (includesDamage) pages += 1;
  if (hasPpsrAppendix) pages += 1;
  return pages;
}
