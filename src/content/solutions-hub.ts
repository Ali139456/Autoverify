export type SolutionTab = "consumer" | "business" | "integrations";

export const SOLUTION_TABS: { slug: SolutionTab; label: string }[] = [
  { slug: "consumer", label: "Consumer" },
  { slug: "business", label: "Business" },
  { slug: "integrations", label: "Integrations" },
];

export type SolutionOfferingCard = {
  id: string;
  title: string;
  description: string;
  bullets: string[];
};

export const CONSUMER_OFFERINGS: SolutionOfferingCard[] = [
  {
    id: "buy",
    title: "Auto Verifi Buy",
    description:
      "Verify before you buy. Get the full past, present and future intelligence of any vehicle before you commit.",
    bullets: [
      "History and title verification",
      "AI powered current condition assessment",
      "Current and Future valuation outlook",
      "Pre Purchase Inspections",
      "Lender Asset Verification",
    ],
  },
  {
    id: "sell",
    title: "Auto Verifi Sell",
    description:
      "Sell with proof. Verified condition and history that earns buyer trust and supports your asking price.",
    bullets: [
      "History and title verification",
      "Current Condition assessment",
      "Verified listing badge",
    ],
  },
  {
    id: "own",
    title: "Auto Verifi Own",
    description:
      "Own with confidence. Track compliance obligations and value across the life of your vehicle.",
    bullets: [
      "Value forecasting",
      "Market value, Debt and Vehicle Equity tracking",
      "Renewal & compliance reminders",
    ],
  },
];

export const BUSINESS_OFFERINGS: SolutionOfferingCard[] = [
  {
    id: "marketplace",
    title: "Marketplace",
    description:
      "Listing verification that earns trust at first glance and lifts conversion.",
    bullets: [
      "Verified listing badges",
      "History & title checks",
      "Seller-side condition reports",
      "Past, Present and Future Car intelligence",
    ],
  },
  {
    id: "lender",
    title: "Lender",
    description:
      "Asset verification intelligence that de-risks secured lending and protects your book.",
    bullets: [
      "Physical & digital asset verification",
      "Independent valuation",
      "Write-off, stolen and finance checks",
      "ID checks",
    ],
  },
  {
    id: "dealer",
    title: "Dealer",
    description:
      "Inventory intelligence and pre-sale verification that builds buyer trust and moves stock faster.",
    bullets: [
      "Pre-sale condition assessment",
      "Verified listing badge",
      "Certified Pre-Owned Inspections",
    ],
  },
  {
    id: "ride-share",
    title: "Ride Share",
    description:
      "Day 1 onboarding vehicle record and continuous vehicle intelligence to improve visibility over vehicle quality and ongoing compliance.",
    bullets: [
      "Vehicle condition record at Day 1 onboarding",
      "Continuous vehicle and maintenance record intelligence",
      "Regulated Safety Checks",
    ],
  },
  {
    id: "insurance",
    title: "Insurance",
    description:
      "Policy inception and continuous vehicle intelligence to reduce fraud, claims and financial risks.",
    bullets: [
      "Day 1 record at time of policy underwriting",
      "Continuous vehicle intelligence throughout policy life",
      "Claims damage assessment",
    ],
  },
  {
    id: "car-rental",
    title: "Car Rental",
    description:
      "Fleet condition and return verification that protects revenue and reduces disputes.",
    bullets: [
      "Check-in & return inspection",
      "AI-Powered Damage Detection",
      "Repair cost estimates",
      "Dispute resolution evidence",
    ],
  },
  {
    id: "car-share",
    title: "Car Share",
    description: "Onboarding and handover vehicle intelligence.",
    bullets: [
      "Day 1 vehicle condition record",
      "Handover condition check",
      "Dispute-ready evidence",
    ],
  },
  {
    id: "fmo",
    title: "FMO",
    description:
      "Fleet-Wide Vehicle Verification and condition assessment across your fleet.",
    bullets: [
      "AI powered End-of-Lease Condition Assessments and Repair estimates",
      "Future Residual Value Forecasting",
      "Fleet Remarketing Intelligence",
    ],
  },
];

export const INTEGRATIONS_CONTENT = {
  eyebrow: "Integrations",
  title: "One intelligence layer, across the automotive ecosystem",
  intro:
    "Auto Verifi sits at the centre of the automotive ecosystem, feeding verified vehicle intelligence to the platforms and businesses that depend on it.",
  ecosystemImage: "/solutions/integrations-ecosystem.png",
};

export function isSolutionTab(slug: string): slug is SolutionTab {
  return slug === "consumer" || slug === "business" || slug === "integrations";
}

/** Homepage `#solutions` section deep links (navbar + legacy redirects). */
export function solutionSectionHref(tab: SolutionTab): string {
  return `/#solutions-${tab}`;
}

export function parseSolutionTabFromHash(hash: string): SolutionTab | null {
  const normalized = hash.replace(/^#/, "");
  if (normalized === "solutions") return "consumer";
  const match = normalized.match(/^solutions-(consumer|business|integrations)$/);
  return match ? (match[1] as SolutionTab) : null;
}

export function solutionTabMeta(tab: SolutionTab): {
  title: string;
  description: string;
} {
  switch (tab) {
    case "consumer":
      return {
        title: "Consumer",
        description:
          "Auto Verifi Buy, Sell and Own — past, present and future vehicle intelligence for private buyers and owners.",
      };
    case "business":
      return {
        title: "Business",
        description:
          "Marketplace, lender, dealer, fleet and mobility solutions powered by independent vehicle intelligence.",
      };
    case "integrations":
      return {
        title: "Integrations",
        description:
          "One intelligence layer across the automotive ecosystem — platforms and partners that depend on verified vehicle data.",
      };
  }
}
