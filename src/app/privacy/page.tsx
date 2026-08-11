import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalDocument";
import {
  PRIVACY_FOOTER,
  PRIVACY_INTRO,
  PRIVACY_SECTIONS,
} from "@/content/privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Auto Verifi Privacy Policy — how we collect, use, protect and share personal and vehicle information.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Auto Verifi Privacy Policy"
      subtitle="Privacy"
      intro={[
        {
          type: "paragraph",
          text: "Your information. Your vehicle. Our responsibility.",
        },
        ...PRIVACY_INTRO,
      ]}
      sections={PRIVACY_SECTIONS}
      footerNote={PRIVACY_FOOTER}
    />
  );
}
