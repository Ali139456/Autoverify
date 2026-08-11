import type { LegalBlock, LegalSection } from "@/components/LegalDocument";

export const TERMS_INTRO: LegalBlock[] = [
  {
    type: "paragraph",
    text: "Auto Verifi Insights is designed to help people make better-informed decisions about vehicles.",
  },
  {
    type: "paragraph",
    text: "Our reports bring together available vehicle information, data-driven insights and, depending on the product selected, technology-assisted analysis to provide a more complete view of a vehicle.",
  },
  {
    type: "paragraph",
    text: "These Terms apply when you access, purchase or use an Auto Verifi Insights report or related Auto Verifi service. By using our services, you agree to these Terms.",
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: "1. What an Auto Verifi Insights Report Provides",
    blocks: [
      {
        type: "paragraph",
        text: "An Auto Verifi Insights report may contain information relating to a vehicle's:",
      },
      {
        type: "list",
        items: [
          "Past — available history and recorded events associated with the vehicle.",
          "Present — available information about the vehicle today, which may include identification, specification, condition and technology-assisted assessment.",
          "Future — market-based insights that may assist in understanding factors such as value, demand and potential depreciation.",
        ],
      },
      {
        type: "paragraph",
        text: "The information included will vary according to the Auto Verifi product selected, the vehicle and the information available at the time the report is generated.",
      },
    ],
  },
  {
    title: "2. Where Our Information Comes From",
    blocks: [
      {
        type: "paragraph",
        text: "Auto Verifi combines information from a range of sources. Depending on the report, these may include government records, vehicle databases, automotive information providers, market-data providers, vehicle owners or sellers, inspection information, photographs, video and technology partners.",
      },
      {
        type: "paragraph",
        text: "Some information displayed by Auto Verifi is therefore information that originated with another organisation. We apply technology and processes to bring this information together, but we cannot guarantee that information originating from another source is always current, complete or error-free.",
      },
      {
        type: "paragraph",
        text: "A missing record should not be interpreted as confirmation that an event or issue has never occurred.",
      },
    ],
  },
  {
    title: "3. Vehicle Verification",
    blocks: [
      {
        type: "paragraph",
        text: "Auto Verifi may use vehicle identifiers and other available information to help verify that information relates to the vehicle being assessed. Verification services can reduce uncertainty, but they cannot eliminate it.",
      },
      {
        type: "paragraph",
        text: "You should check important vehicle identifiers and documentation yourself before completing a transaction.",
      },
    ],
  },
  {
    title: "4. Vehicle History",
    blocks: [
      {
        type: "paragraph",
        text: "Historical information reflects records available to Auto Verifi when the report is generated. Records may be added, amended or become available after a report has been produced.",
      },
      {
        type: "paragraph",
        text: "Auto Verifi cannot guarantee that every incident, repair, ownership event, odometer event, registration event or other historical matter relating to a vehicle will appear in a report.",
      },
      {
        type: "paragraph",
        text: "Where an official government or statutory record is provided, the underlying official record should be relied upon for its specific purpose.",
      },
    ],
  },
  {
    title: "5. Market Value & Vehicle Intelligence",
    blocks: [
      {
        type: "paragraph",
        text: "Auto Verifi may provide estimated values, market ranges, pricing intelligence, demand indicators, depreciation insights or other market information. These are analytical tools rather than guaranteed transaction prices.",
      },
      {
        type: "paragraph",
        text: "The actual value of a vehicle can be influenced by its physical condition, kilometres travelled, location, specification, options, service history, previous damage, modifications, market demand and many other factors. The price a buyer is willing to pay — or a seller is willing to accept — may therefore be different from an Auto Verifi estimate.",
      },
    ],
  },
  {
    title: "6. AI & Technology-Assisted Condition Insights",
    blocks: [
      {
        type: "paragraph",
        text: "Some Auto Verifi services may use artificial intelligence, computer vision and other technologies to analyse vehicle images, video or data. Technology-assisted analysis may identify visible characteristics such as apparent scratches, dents, panel damage, vehicle configuration, odometer information or other observable features.",
      },
      {
        type: "paragraph",
        text: "These tools provide additional intelligence about a vehicle but have limitations. Results can be affected by image quality, lighting, camera angles, obstruction, cleanliness and the information supplied for analysis.",
      },
      {
        type: "paragraph",
        text: "Technology-assisted condition intelligence should therefore not be interpreted as confirmation that a vehicle has no other damage or defects.",
      },
    ],
  },
  {
    title: "7. What an Insights Report Is Not",
    blocks: [
      {
        type: "paragraph",
        text: "Unless the report expressly says otherwise, Auto Verifi Insights is not:",
      },
      {
        type: "list",
        items: [
          "a comprehensive mechanical inspection;",
          "a roadworthiness certificate;",
          "an engineering assessment;",
          "a structural inspection;",
          "a guarantee of vehicle condition;",
          "a guarantee of vehicle ownership or title;",
          "financial or investment advice;",
          "insurance advice; or",
          "a guarantee of future vehicle value.",
        ],
      },
      {
        type: "paragraph",
        text: "Auto Verifi Insights is intended to provide additional information to support your own decision-making.",
      },
    ],
  },
  {
    title: "8. Making a Vehicle Decision",
    blocks: [
      {
        type: "paragraph",
        text: "Buying a vehicle can involve risks that cannot be identified from data alone. For significant vehicle transactions, you should consider the information in an Auto Verifi Insights report together with your own enquiries.",
      },
      {
        type: "paragraph",
        text: "Depending on the vehicle and transaction, this may include inspecting the vehicle, checking its documentation, confirming the identity and authority of the seller and obtaining an independent mechanical or specialist inspection.",
      },
      {
        type: "paragraph",
        text: "You remain responsible for deciding whether a vehicle is appropriate for you and whether to proceed with a transaction.",
      },
    ],
  },
  {
    title: "9. Information You Provide",
    blocks: [
      {
        type: "paragraph",
        text: "The quality of an Auto Verifi result can depend on the information supplied to us. You should ensure that information such as the VIN, registration number, odometer reading, photographs and other vehicle details you provide are accurate.",
      },
      {
        type: "paragraph",
        text: "Auto Verifi is not responsible for an incorrect result to the extent that it results from incorrect or incomplete information supplied to us.",
      },
    ],
  },
  {
    title: "10. Changes After a Report Is Generated",
    blocks: [
      {
        type: "paragraph",
        text: "A vehicle is not static. Its condition, kilometres, registration status, financial interests, market value and other characteristics can change.",
      },
      {
        type: "paragraph",
        text: "An Auto Verifi Insights report represents information available at a particular point in time. A report generated previously should not automatically be assumed to represent the vehicle's current status.",
      },
    ],
  },
  {
    title: "11. Using Auto Verifi Content",
    blocks: [
      {
        type: "paragraph",
        text: "When you purchase an Auto Verifi Insights report, we give you permission to use that report for your personal or authorised business purpose.",
      },
      {
        type: "paragraph",
        text: "That permission does not give you ownership of Auto Verifi's platform, technology, methodologies, report designs, scoring systems, analysis or underlying intellectual property.",
      },
      {
        type: "paragraph",
        text: "Without our written permission, you must not systematically extract Auto Verifi data, build a competing database from our services, resell our data or reports, use automated systems to scrape our platform, reverse engineer our technology or commercially reproduce our proprietary content.",
      },
    ],
  },
  {
    title: "12. Third-Party Services",
    blocks: [
      {
        type: "paragraph",
        text: "Some Auto Verifi functionality depends on services, technology or information supplied by third parties. Those services may occasionally be unavailable, delayed or changed.",
      },
      {
        type: "paragraph",
        text: "Auto Verifi may also change its data providers, technology providers and report features as our services develop.",
      },
    ],
  },
  {
    title: "13. Availability of Auto Verifi",
    blocks: [
      {
        type: "paragraph",
        text: "We aim to make Auto Verifi services reliably available, but uninterrupted access cannot be guaranteed. Maintenance, technical issues, third-party systems or circumstances outside our control may occasionally affect availability.",
      },
    ],
  },
  {
    title: "14. Responsibility for Auto Verifi Information",
    blocks: [
      {
        type: "paragraph",
        text: "We take reasonable steps to provide useful and reliable vehicle intelligence. However, vehicle information is drawn from multiple sources and some matters cannot be identified through databases, images or automated analysis.",
      },
      {
        type: "paragraph",
        text: "To the extent permitted by law, Auto Verifi is not responsible for losses resulting from information that was inaccurate, incomplete or unavailable from an external source, or from a user treating an Auto Verifi Insights report as a guarantee about a vehicle.",
      },
      {
        type: "paragraph",
        text: "Nothing in these Terms is intended to exclude or limit rights or remedies that cannot lawfully be excluded, including applicable rights under the Australian Consumer Law.",
      },
    ],
  },
  {
    title: "15. Intellectual Property",
    blocks: [
      {
        type: "paragraph",
        text: "Auto Verifi's branding, platform, report presentation, software, methodologies, analysis and proprietary technology are owned by or licensed to Auto Verifi.",
      },
      {
        type: "paragraph",
        text: "Information supplied by third parties may remain subject to the intellectual property rights and licensing conditions of those providers.",
      },
    ],
  },
  {
    title: "16. Privacy",
    blocks: [
      {
        type: "paragraph",
        text: "Personal information collected through Auto Verifi is handled in accordance with the Auto Verifi Privacy Policy. We may use service providers and technology partners to process information where this is required to provide our services.",
      },
    ],
  },
  {
    title: "17. Updates to Auto Verifi",
    blocks: [
      {
        type: "paragraph",
        text: "Vehicle intelligence technology and the information available to us will continue to evolve. We may introduce, remove or modify report features, data sources, analytical tools and other functionality.",
      },
      {
        type: "paragraph",
        text: "We may also update these Terms. The version published when you use the relevant service will apply to that use.",
      },
    ],
  },
  {
    title: "18. Australian Law",
    blocks: [
      {
        type: "paragraph",
        text: "These Terms are governed by the laws of New South Wales, Australia. Nothing in these Terms affects any statutory rights you have under Australian law.",
      },
    ],
  },
];

export const TERMS_FOOTER: LegalBlock[] = [
  {
    type: "paragraph",
    text: "IMPORTANT INFORMATION ABOUT YOUR AUTO VERIFI INSIGHTS REPORT",
  },
  {
    type: "paragraph",
    text: "Auto Verifi helps you see more before you make a vehicle decision. Our reports combine available vehicle information and technology-driven insights to help build a picture of a vehicle's past, present and future.",
  },
  {
    type: "paragraph",
    text: "No database, inspection or technology can identify every issue affecting a vehicle. Information can change, third-party records may contain gaps, and AI-assisted analysis may not identify defects that are hidden or not visible in the information provided.",
  },
  {
    type: "paragraph",
    text: "Use your Auto Verifi Insights report as part of your vehicle due diligence — not as a substitute for your own enquiries or an appropriate independent inspection.",
  },
];
