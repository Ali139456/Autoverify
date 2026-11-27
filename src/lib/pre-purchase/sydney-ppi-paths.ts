export const SYDNEY_PPI_HOME = "/sydneyprepurchase";
export const SYDNEY_PPI_BOOK_HREF = "/sydneyprepurchase/book";
export const SYDNEY_PPI_SERVICES_HREF = "/sydneyprepurchase/services";
export const SYDNEY_PPI_WHAT_WE_CHECK_HREF = "/sydneyprepurchase/what-we-check";
export const SYDNEY_PPI_HOW_IT_WORKS_HREF = "/sydneyprepurchase/how-it-works";
export const SYDNEY_PPI_ABOUT_HREF = "/sydneyprepurchase/about";

export function sydneyPpiServiceHref(slug: string): string {
  return `/sydneyprepurchase/services/${slug}`;
}

export function sydneyPpiBookWithCategory(category: string): string {
  return `${SYDNEY_PPI_BOOK_HREF}?vehicleCategory=${encodeURIComponent(category)}`;
}