/** "Car Buying Checklist" page shown before the PPSR appendix on every report. */

export const CAR_BUYING_CHECKLIST_TITLE = "Car Buying Checklist";

export const CAR_BUYING_CHECKLIST_INTRO =
  "After receiving your Auto Verifi report, there are a few more steps to complete in your car buying journey:";

export type CarBuyingChecklistItem = {
  title: string;
  body: string;
  linkLabel?: string;
  href?: string;
};

export const CAR_BUYING_CHECKLIST_ITEMS: readonly CarBuyingChecklistItem[] = [
  {
    title: "Independent mechanical inspection",
    body: "For added confidence before buying your used car, engage an independent mechanic to conduct a thorough physical inspection on the vehicle before buying.",
  },
  {
    title: "Payment Escrow",
    body: "Always use a payment escrow when exchanging money and transferring ownership on a privately purchased vehicle.",
    linkLabel: "www.veme.me",
    href: "https://www.veme.me",
  },
  {
    title: "Registration and Transport",
    body: "If you need assistance transferring ownership and transporting your car.",
    linkLabel: "www.intraffic.com.au",
    href: "https://www.intraffic.com.au",
  },
];
