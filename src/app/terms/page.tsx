import type { Metadata } from "next";
import { LegalDocument } from "@/components/LegalDocument";
import {
  TERMS_FOOTER,
  TERMS_INTRO,
  TERMS_PAGE_TITLE,
  TERMS_SECTIONS,
} from "@/content/terms-of-use";

export const metadata: Metadata = {
  title: "Website & Report Terms of Use",
  description:
    "Auto Verifi website and report terms — terms applying when you access, purchase or use an Auto Verifi report or related service.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalDocument
      title={TERMS_PAGE_TITLE}
      subtitle="Legal"
      intro={TERMS_INTRO}
      sections={TERMS_SECTIONS}
      footerNote={TERMS_FOOTER}
    />
  );
}
