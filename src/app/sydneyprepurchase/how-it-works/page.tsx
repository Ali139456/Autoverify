import type { Metadata } from "next";
import { SydneyPpiHowItWorksPage } from "@/components/sydney-pre-purchase/SydneyPpiHowItWorksPage";

export const metadata: Metadata = {
  title: "How a mobile pre-purchase inspection works | Sydney",
  description:
    "From booking to same-day report: we contact the seller, inspect onsite, run diagnostics and a road test, then deliver a photo-backed report.",
  alternates: { canonical: "/sydneyprepurchase/how-it-works" },
};

export default function SydneyPpiHowItWorksRoute() {
  return <SydneyPpiHowItWorksPage />;
}