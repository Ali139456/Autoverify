import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalDocument";
import {
  TERMS_FOOTER,
  TERMS_INTRO,
  TERMS_SECTIONS,
} from "@/content/terms-of-use";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Auto Verifi Insights Terms of Use — terms applying when you access, purchase or use an Auto Verifi Insights report or related service.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Auto Verifi Insights — Terms of Use"
      subtitle="Legal"
      intro={[
        { type: "paragraph", text: "About Auto Verifi Insights" },
        ...TERMS_INTRO,
      ]}
      sections={TERMS_SECTIONS}
      footerNote={TERMS_FOOTER}
    />
  );
}
