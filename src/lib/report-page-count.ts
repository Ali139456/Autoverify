export function countVehicleReportPages(
  includesDamage: boolean,
  hasPpsrAppendix: boolean,
  hasVehicleSpecSheet = false,
  hasFactoryFeatures = false,
): number {
  let pages = 1; // Overview (status, key insights, warranty)
  pages += 3; // Present/future + comparables, P-plate, ride-share
  if (hasVehicleSpecSheet) pages += 1;
  if (hasVehicleSpecSheet && hasFactoryFeatures) pages += 1; // Factory list (continued)
  if (includesDamage) pages += 1; // Insights+ body condition + photos/damage
  pages += 1; // Car buying checklist + general disclaimer
  if (hasPpsrAppendix) pages += 1;
  return pages;
}
