export type InspectionMenuItem =
  | {
      label: string;
      status: "coming_soon";
    }
  | {
      label: string;
      href: string;
      external?: boolean;
    };

export const INSPECTION_MENU_ITEMS: InspectionMenuItem[] = [
  {
    label: "Lender Asset Verification",
    href: "/inspections/lender-asset-verification",
  },
  {
    label: "Pre Purchase Inspections",
    href: "/inspections/pre-purchase",
  },
  { label: "EV Battery Health Checks", status: "coming_soon" },
];
