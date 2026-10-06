/** Matches web `ReportShell` logo lockup (560×90 SVG aspect). */
export const REPORT_LOGO_ASPECT_RATIO = 560 / 90;

export const REPORT_HEADER_LOGO_HEIGHT = 52;
export const REPORT_FOOTER_LOGO_HEIGHT = 34;

export function reportLogoWidthForHeight(height: number): number {
  return Math.round(height * REPORT_LOGO_ASPECT_RATIO);
}

export const REPORT_HEADER_LOGO_WIDTH =
  reportLogoWidthForHeight(REPORT_HEADER_LOGO_HEIGHT);

export const REPORT_FOOTER_LOGO_WIDTH =
  reportLogoWidthForHeight(REPORT_FOOTER_LOGO_HEIGHT);

/** Purchase email — larger lockup (many clients render img smaller than CSS). */
export const PURCHASE_EMAIL_HEADER_LOGO_HEIGHT = 80;
export const PURCHASE_EMAIL_FOOTER_LOGO_HEIGHT = 56;

export const PURCHASE_EMAIL_HEADER_LOGO_WIDTH = reportLogoWidthForHeight(
  PURCHASE_EMAIL_HEADER_LOGO_HEIGHT,
);

export const PURCHASE_EMAIL_FOOTER_LOGO_WIDTH = reportLogoWidthForHeight(
  PURCHASE_EMAIL_FOOTER_LOGO_HEIGHT,
);

/** Tax invoice PDF — prominent header/footer lockup (customer-facing). */
export const TAX_INVOICE_HEADER_LOGO_HEIGHT = PURCHASE_EMAIL_HEADER_LOGO_HEIGHT;
export const TAX_INVOICE_FOOTER_LOGO_HEIGHT = PURCHASE_EMAIL_FOOTER_LOGO_HEIGHT;

export const TAX_INVOICE_HEADER_LOGO_WIDTH = PURCHASE_EMAIL_HEADER_LOGO_WIDTH;
export const TAX_INVOICE_FOOTER_LOGO_WIDTH = PURCHASE_EMAIL_FOOTER_LOGO_WIDTH;
