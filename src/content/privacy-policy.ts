import type { LegalBlock, LegalSection } from "@/components/LegalDocument";

export const PRIVACY_INTRO: LegalBlock[] = [
  {
    type: "paragraph",
    text: "Auto Verifi provides vehicle intelligence and verification services designed to help customers make more informed decisions about vehicles.",
  },
  {
    type: "paragraph",
    text: "Providing these services may require us to collect and process information about you, a vehicle, a transaction and your interaction with Auto Verifi.",
  },
  {
    type: "paragraph",
    text: "This Privacy Policy explains what information Auto Verifi collects, why we collect it, how we use and protect it, when information may be shared with our service and technology partners, and the choices available to you.",
  },
  {
    type: "paragraph",
    text: "Auto Verifi is committed to handling personal information in accordance with applicable Australian privacy laws, including the Privacy Act 1988 (Cth) and Australian Privacy Principles.",
  },
];

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    title: "1. Information We May Collect",
    blocks: [
      {
        type: "paragraph",
        text: "The information Auto Verifi collects depends on the service you use.",
      },
      {
        type: "paragraph",
        text: "Your identity and contact information may include name, email address, mobile number, date of birth where required, address, account information and other information you provide when creating or using an Auto Verifi account.",
      },
      {
        type: "paragraph",
        text: "Where an Auto Verifi service requires identity or ownership verification, we may collect or process information necessary to complete that verification. This may include information contained in identity documents, photographs, verification results and information required to establish whether a person appears authorised to deal with a vehicle. Where possible, verification may be performed through specialist technology providers rather than Auto Verifi retaining the underlying identity document.",
      },
      {
        type: "paragraph",
        text: "We may collect and process vehicle information including VIN, registration number, make, model and variant, manufacture and compliance information, odometer readings, vehicle specifications, vehicle history information, photographs and video, inspection information, condition information, market and valuation information and other information required to generate Auto Verifi Insights.",
      },
      {
        type: "paragraph",
        text: "Some vehicle information may also constitute personal information where it can reasonably be connected with an identifiable individual.",
      },
    ],
  },
  {
    title: "2. Images, Video & AI Analysis",
    blocks: [
      {
        type: "paragraph",
        text: "Auto Verifi services may allow you to submit photographs, video and other vehicle information for automated or technology-assisted assessment. These materials may be processed using artificial intelligence, computer vision and other technologies to generate vehicle intelligence.",
      },
      {
        type: "paragraph",
        text: "Depending on the service, this may include identifying or assessing vehicle identity and specification, exterior components, visible scratches, dents or damage, apparent vehicle condition, odometer information, vehicle configuration and other observable vehicle characteristics.",
      },
      {
        type: "paragraph",
        text: "Images may incidentally contain personal information such as faces, registration plates, addresses or surrounding locations. You should avoid including unnecessary personal or sensitive information when capturing vehicle images.",
      },
    ],
  },
  {
    title: "3. Information From Other Sources",
    blocks: [
      {
        type: "paragraph",
        text: "Auto Verifi's purpose is to bring relevant vehicle intelligence together. We may therefore receive information from third parties including government and regulatory sources, vehicle-data providers, identity and verification providers, market and valuation-data providers, vehicle condition technology providers, financial-interest and vehicle-history services, dealers and automotive businesses, insurers, lenders, fleet operators or other organisations using Auto Verifi, vehicle owners and sellers and other technology and service providers.",
      },
      {
        type: "paragraph",
        text: "The information available from these sources may vary depending on the vehicle and service requested.",
      },
    ],
  },
  {
    title: "4. How We Use Information",
    blocks: [
      {
        type: "paragraph",
        text: "We may use personal and vehicle information to:",
      },
      {
        type: "list",
        items: [
          "provide Auto Verifi products and services;",
          "generate Auto Verifi Insights reports;",
          "identify and verify vehicles;",
          "undertake identity and ownership verification;",
          "provide vehicle history intelligence;",
          "perform AI-assisted vehicle condition analysis;",
          "provide market-value and transaction intelligence;",
          "respond to enquiries and provide customer support;",
          "operate and secure Auto Verifi accounts;",
          "detect suspicious activity, fraud or misuse;",
          "improve the accuracy and functionality of our services;",
          "develop new Auto Verifi products and features;",
          "conduct analytics and understand how our services are being used;",
          "maintain appropriate business and compliance records; and",
          "meet our legal and regulatory obligations.",
        ],
      },
      {
        type: "paragraph",
        text: "Where required by law, we will obtain consent before using personal information for another purpose.",
      },
    ],
  },
  {
    title: "5. Improving Auto Verifi Intelligence",
    blocks: [
      {
        type: "paragraph",
        text: "We may analyse information generated through the use of Auto Verifi to understand how our services perform and how they can be improved.",
      },
      {
        type: "paragraph",
        text: "Where appropriate, we may aggregate or de-identify information so that it no longer identifies an individual. Aggregated and de-identified information may be used for analytics, research, product development, vehicle intelligence modelling and improving Auto Verifi technology.",
      },
    ],
  },
  {
    title: "6. Who We May Share Information With",
    blocks: [
      {
        type: "paragraph",
        text: "Providing an Auto Verifi service may require information to move securely between Auto Verifi and organisations that provide part of the service. Depending on the product you use, these may include identity and verification providers, vehicle-data providers, AI and vehicle condition technology providers, valuation and automotive market-data providers, government or regulatory services, payment providers, cloud and technology infrastructure providers, professional advisers, organisations authorised by you to receive an Auto Verifi report and other suppliers necessary to deliver the service you requested.",
      },
      {
        type: "paragraph",
        text: "We only disclose personal information where permitted or required by law and for purposes connected with operating and providing Auto Verifi services.",
      },
    ],
  },
  {
    title: "7. We Don't Sell Your Identity",
    blocks: [
      {
        type: "paragraph",
        text: "Auto Verifi's business is vehicle intelligence — not selling your personal identity. We do not sell your identity documents or personal identification information to third parties for their independent marketing purposes.",
      },
      {
        type: "paragraph",
        text: "Where personal information needs to be provided to a technology or data partner to complete a service you requested, only information reasonably required for that purpose should be provided.",
      },
    ],
  },
  {
    title: "8. Data Security",
    blocks: [
      {
        type: "paragraph",
        text: "Vehicle intelligence depends on trust. Auto Verifi takes reasonable technical and organisational measures designed to protect personal information against loss, misuse, interference and unauthorised access, modification or disclosure.",
      },
      {
        type: "paragraph",
        text: "Our security approach may include access controls, authentication, encryption, system monitoring and appropriate controls over service providers. No online system can guarantee absolute security.",
      },
      {
        type: "paragraph",
        text: "If Auto Verifi becomes aware of a data breach requiring notification under Australian law, we will take the steps required by applicable legislation.",
      },
    ],
  },
  {
    title: "9. Storage & Retention",
    blocks: [
      {
        type: "paragraph",
        text: "We retain personal information for as long as reasonably necessary to provide our services, operate our business and satisfy legal, regulatory and record-keeping requirements. Different categories of information may be retained for different periods.",
      },
      {
        type: "paragraph",
        text: "When personal information is no longer reasonably required, we will take reasonable steps to delete or de-identify it, unless we are required or permitted by law to retain it.",
      },
    ],
  },
  {
    title: "10. Overseas Processing",
    blocks: [
      {
        type: "paragraph",
        text: "Some technology, cloud, data or service providers used by Auto Verifi may process or store information outside Australia.",
      },
      {
        type: "paragraph",
        text: "Where personal information is disclosed overseas, Auto Verifi will take reasonable steps to ensure it is handled consistently with applicable Australian privacy requirements. The countries involved may change as our technology and service-provider arrangements evolve.",
      },
    ],
  },
  {
    title: "11. Cookies & Digital Information",
    blocks: [
      {
        type: "paragraph",
        text: "When you use an Auto Verifi website or digital service, we may automatically collect technical information including IP address, browser and device information, operating system, pages or services accessed, time and date of access, referral information and interactions with the Auto Verifi platform.",
      },
      {
        type: "paragraph",
        text: "We may use cookies and similar technologies to operate our services, maintain security, understand usage and improve the customer experience.",
      },
    ],
  },
  {
    title: "12. Communications",
    blocks: [
      {
        type: "paragraph",
        text: "Where permitted, Auto Verifi may contact you about services you use and other Auto Verifi products or information that may be relevant to you. You can opt out of marketing communications using the unsubscribe mechanism provided with those communications.",
      },
      {
        type: "paragraph",
        text: "Operational and service communications may still be sent where required to provide a service or administer your account.",
      },
    ],
  },
  {
    title: "13. Accessing or Correcting Your Information",
    blocks: [
      {
        type: "paragraph",
        text: "You may request access to personal information Auto Verifi holds about you or ask us to correct information you believe is inaccurate. We may need to verify your identity before processing an access or correction request. Certain legal exceptions may apply.",
      },
    ],
  },
  {
    title: "14. Privacy Questions & Complaints",
    blocks: [
      {
        type: "paragraph",
        text: "If you have a question about how Auto Verifi handles your personal information, would like to request access or correction, or wish to make a privacy complaint, please contact:",
      },
      {
        type: "paragraph",
        text: "Privacy Officer, Auto Verifi. Email: info@autoverifi.com.au. Website: www.autoverifi.com.au",
      },
      {
        type: "paragraph",
        text: "We will review privacy complaints and respond within a reasonable period. If you are not satisfied with our response, you may have the right to contact the Office of the Australian Information Commissioner.",
      },
    ],
  },
  {
    title: "15. Changes to This Policy",
    blocks: [
      {
        type: "paragraph",
        text: "Auto Verifi and the technologies supporting vehicle intelligence will continue to evolve. We may update this Privacy Policy when our services, technology, legal obligations or information-handling practices change. The current version will be published on the Auto Verifi website with its effective date.",
      },
    ],
  },
];

export const PRIVACY_FOOTER: LegalBlock[] = [
  {
    type: "paragraph",
    text: "OUR PRIVACY PRINCIPLE",
  },
  {
    type: "paragraph",
    text: "Better vehicle intelligence shouldn't come at the expense of your privacy.",
  },
  {
    type: "paragraph",
    text: "Auto Verifi uses information to help verify vehicles, understand their past, assess their present and provide insights about their future. We aim to collect what we need, protect what you provide and be transparent about how information moves through the Auto Verifi intelligence ecosystem.",
  },
];
