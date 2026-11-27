export const SYDNEY_PPI_BOOK_HREF = "/sydneyprepurchase/book";

export function sydneyPpiServiceHref(slug: string): string {
  return `/sydneyprepurchase/services/${slug}`;
}

export function sydneyPpiBookWithCategory(category: string): string {
  return `${SYDNEY_PPI_BOOK_HREF}?vehicleCategory=${encodeURIComponent(category)}`;
}