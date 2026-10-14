export function countVehicleReportPages(
  includesDamage: boolean,
  hasPpsrAppendix: boolean,
  hasVehicleSpecSheet = false,
  hasFactoryFeatures = false,
  hasAdditionalInspectionPhotos = true,
): number {
  let pages = 1; // Overview + key insights + warranty + service history (one compressed print sheet)
  pages += 4; // Present/future; odometer + comparables; P-plate; ride-share
  if (hasVehicleSpecSheet) pages += 1;
  if (hasVehicleSpecSheet && hasFactoryFeatures) pages += 1; // Factory list (continued)
  if (includesDamage) {
    pages += 2; // Walkaround + damage
    if (hasAdditionalInspectionPhotos) pages += 1;
  }
  pages += 1; // Car buying checklist + general disclaimer
  if (hasPpsrAppendix) pages += 1;
  return pages;
}
