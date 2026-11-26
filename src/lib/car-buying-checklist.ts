/** Final report sheet before PPSR — matches purchase confirmation email footer. */

export const NEXT_STEPS_TO_PURCHASE_TITLE = "Next steps to purchase";

export const PRE_PURCHASE_INSPECTION_URL =
  "https://autoverifi.com.au/inspections/pre-purchase";

export type NextStepsToPurchaseItem = {
  title: string;
  body: string;
  linkLabel?: string;
  href?: string;
};

export const NEXT_STEPS_TO_PURCHASE_ITEMS: readonly NextStepsToPurchaseItem[] =
  [
    {
      title: "Pre-purchase inspection",
      body: "Book a professional inspection before you buy (use Google to research a credible mobile pre-purchase inspections provider).",
      linkLabel: "autoverifi.com.au/inspections/pre-purchase",
      href: PRE_PURCHASE_INSPECTION_URL,
    },
    {
      title: "Payment escrow",
      body: "Secure your payment with an independent escrow service.",
      linkLabel: "www.veme.me",
      href: "https://www.veme.me",
    },
    {
      title: "Registration and transport",
      body: "Arrange registration transfers and vehicle transport.",
      linkLabel: "www.intraffic.com.au",
      href: "https://www.intraffic.com.au",
    },
  ];

/** @deprecated Use NEXT_STEPS_TO_PURCHASE_* — kept for imports during rename. */
export const CAR_BUYING_CHECKLIST_TITLE = NEXT_STEPS_TO_PURCHASE_TITLE;

/** @deprecated No longer shown on reports (email layout has no intro line). */
export const CAR_BUYING_CHECKLIST_INTRO = "";

export type CarBuyingChecklistItem = NextStepsToPurchaseItem;

/** @deprecated Use NEXT_STEPS_TO_PURCHASE_ITEMS */
export const CAR_BUYING_CHECKLIST_ITEMS = NEXT_STEPS_TO_PURCHASE_ITEMS;