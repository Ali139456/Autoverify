/** Pre-purchase bookings — vehicle inspections landing (contact form). */
export const PRE_PURCHASE_INSPECTIONS_HREF = "/vehicleinspections#contact";

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
    label: "Pre Purchase Inspections",
    href: PRE_PURCHASE_INSPECTIONS_HREF,
  },
  { label: "EV Battery Health Checks", status: "coming_soon" },
  { label: "Lender Asset Verification", status: "coming_soon" },
  { label: "Ride Share Inspections", status: "coming_soon" },
  { label: "End of Lease Inspections", status: "coming_soon" },
  {
    label: "Hazard Inspections",
    href: "https://www.hazardinspect.com.au",
    external: true,
  },
  {
    label: "Pre Delivery Inspections",
    href: "https://www.predelivery.ai",
    external: true,
  },
];
