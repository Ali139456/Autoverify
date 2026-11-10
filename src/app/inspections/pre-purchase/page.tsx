import type { Metadata } from "next";
import { PrePurchaseSite } from "@/components/pre-purchase/PrePurchaseSite";

export const metadata: Metadata = {
  title: "Pre-Purchase Vehicle Inspection",
  description:
    "Book a mobile pre-purchase vehicle inspection in Sydney with Auto Verifi.",
  robots: { index: true, follow: true },
};

export default function PrePurchaseInspectionPage() {
  return <PrePurchaseSite />;
}
