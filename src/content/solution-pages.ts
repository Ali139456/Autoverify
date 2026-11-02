export type SolutionSection = {
  heading: string;
  subheading?: string;
  bullets?: string[];
};

export type SolutionPageContent = {
  slug: string;
  title: string;
  metaDescription: string;
  heroTitle: string;
  heroIntro: string;
  sections: SolutionSection[];
  cta?: {
    heading: string;
    text: string;
  };
};

export const SOLUTION_PAGES: SolutionPageContent[] = [
  {
    slug: "consumer",
    title: "Consumer",
    metaDescription:
      "Buy your next car with confidence — independent past, present and future vehicle intelligence from Auto Verifi.",
    heroTitle: "Buy your next car with confidence.",
    heroIntro:
      "Every used car has a story. Auto Verifi helps uncover it — whether you're buying privately, through a dealership or online. Our independent intelligence reduces risk before you commit.",
    sections: [
      {
        heading: "Three layers of independent intelligence",
        subheading:
          "Most inspection companies only tell you what's wrong today. We help you understand the whole picture.",
        bullets: [
          "Vehicle history",
          "Finance owing",
          "Written-off status",
          "Stolen vehicle checks",
          "Registration history",
          "VIN verification",
          "Ownership validation",
          "Independent inspection",
          "Mechanical assessment",
          "Body condition",
          "Digital photos",
          "Video walkaround",
          "Current market value",
          "Risk assessment",
          "Depreciation forecast",
          "Maintenance costs",
          "Future value estimate",
          "Ownership costs",
          "Vehicle recommendations",
        ],
      },
    ],
    cta: {
      heading: "Found a car you like?",
      text: "Book an independent inspection and know exactly what you're buying.",
    },
  },
  {
    slug: "dealers",
    title: "Dealers",
    metaDescription:
      "Auto Verifi helps dealerships build trust with independent assessments, certified reports and the Verified Dealer Program.",
    heroTitle: "Helping dealers build trust.",
    heroIntro:
      "Auto Verifi partners with dealerships to improve transparency and customer confidence — turning independent assessment into a competitive advantage.",
    sections: [
      {
        heading: "Transparency that converts buyers.",
        subheading:
          "Independent, defensible reporting helps your customers buy with confidence — reducing disputes and building a reputation buyers trust.",
      },
      {
        heading: "Services include",
        bullets: [
          "Pre-sale inspections",
          "Certified vehicle reports",
          "Vehicle grading",
          "Trade-in assessments",
          "Valuation reports",
          "Digital condition reports",
          "Verified Dealer Program",
          "Complaint prevention",
        ],
      },
    ],
    cta: {
      heading: "Join the Verified Dealer Program.",
      text: "Show buyers your vehicles are independently assessed and certified.",
    },
  },
  {
    slug: "government",
    title: "Government",
    metaDescription:
      "Independent motor dealer assessment and consulting for regulators and government agencies.",
    heroTitle: "Independent motor dealer assessment specialists.",
    heroIntro:
      "Auto Verifi provides independent assessment and consulting services supporting regulators, government agencies and industry.",
    sections: [
      {
        heading: "Our services include",
        bullets: [
          "Motor dealer inspections",
          "Site assessments",
          "Consumer complaint investigations",
          "Vehicle assessments",
          "Dealer documentation reviews",
          "Compliance reporting",
          "Photographic evidence",
          "Technical assessments",
          "Expert opinions",
          "Independent reporting",
        ],
      },
      {
        heading: "Supporting better consumer outcomes",
        subheading: "Our assessments assist organisations to improve compliance, evidence and consumer protection.",
      },
    ],
    cta: {
      heading: "Engage independent vehicle expertise.",
      text: "Evidence-based, defensible findings for regulators and government agencies.",
    },
  },
  {
    slug: "audit",
    title: "Audit & consulting",
    metaDescription:
      "Independent vehicle and motor dealer consulting for regulators, insurers, fleet operators and expert matters.",
    heroTitle: "Independent vehicle & motor dealer consulting.",
    heroIntro:
      "Specialist consulting services for regulators, insurers, fleet operators and organisations requiring independent vehicle expertise.",
    sections: [
      {
        heading: "Services",
        bullets: [
          "Motor dealer operational assessments",
          "Vehicle inspections",
          "Technical investigations",
          "Documentation reviews",
          "Compliance audits",
          "Consumer dispute investigations",
          "Expert reports",
          "Dealer process reviews",
          "Asset verification",
          "Vehicle identity investigations",
          "Risk assessments",
          "Independent consulting",
        ],
      },
      {
        heading: "Deliverables",
        bullets: [
          "Comprehensive assessment reports",
          "Photographic evidence",
          "Vehicle documentation reviews",
          "Executive summaries",
          "Recommendations",
          "Supporting technical evidence",
          "Regulatory reporting",
        ],
      },
    ],
    cta: {
      heading: "Need an independent expert?",
      text: "Defensible, evidence-based reporting tailored to your matter.",
    },
  },
];

export function getSolutionPage(slug: string): SolutionPageContent | undefined {
  return SOLUTION_PAGES.find((p) => p.slug === slug);
}
