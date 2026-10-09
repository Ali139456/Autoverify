/**
 * Aspect ratio of `public/logo/logo-blue.png` (2363×380, from `auto-verifi-accent.svg`).
 * Used for PDF + email where the SVG lockup can't be embedded.
 */
export const REPORT_LOGO_ASPECT_RATIO = 2363 / 380;

/** Public path of the colour logo used in PDFs and emails. */
export const REPORT_LOGO_PNG_PATH = "/logo/logo-blue.png";

export const REPORT_HEADER_LOGO_HEIGHT = 30;
export const REPORT_FOOTER_LOGO_HEIGHT = 18;

export function reportLogoWidthForHeight(height: number): number {
  return Math.round(height * REPORT_LOGO_ASPECT_RATIO);
}

export const REPORT_HEADER_LOGO_WIDTH =
  reportLogoWidthForHeight(REPORT_HEADER_LOGO_HEIGHT);

export const REPORT_FOOTER_LOGO_WIDTH =
  reportLogoWidthForHeight(REPORT_FOOTER_LOGO_HEIGHT);

/** Purchase email — larger lockup (many clients render img smaller than CSS). */
export const PURCHASE_EMAIL_HEADER_LOGO_HEIGHT = 44;
export const PURCHASE_EMAIL_FOOTER_LOGO_HEIGHT = 32;

export const PURCHASE_EMAIL_HEADER_LOGO_WIDTH = reportLogoWidthForHeight(
  PURCHASE_EMAIL_HEADER_LOGO_HEIGHT,
);

export const PURCHASE_EMAIL_FOOTER_LOGO_WIDTH = reportLogoWidthForHeight(
  PURCHASE_EMAIL_FOOTER_LOGO_HEIGHT,
);

/** Tax invoice PDF — prominent header/footer lockup (customer-facing). */
export const TAX_INVOICE_HEADER_LOGO_HEIGHT = 40;
export const TAX_INVOICE_FOOTER_LOGO_HEIGHT = 20;

export const TAX_INVOICE_HEADER_LOGO_WIDTH = PURCHASE_EMAIL_HEADER_LOGO_WIDTH;
export const TAX_INVOICE_FOOTER_LOGO_WIDTH = PURCHASE_EMAIL_FOOTER_LOGO_WIDTH;

/** Pin PNG lockups to the left edge so the tagline aligns with “Past” below. */
export const REPORT_LOGO_OBJECT_POSITION = "left center" as const;
