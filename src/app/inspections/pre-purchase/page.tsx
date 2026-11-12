import type { Metadata } from "next";
import { PrePurchaseSite } from "@/components/pre-purchase/PrePurchaseSite";

export const metadata: Metadata = {
  title: "Pre-Purchase Vehicle Inspection",
  description:
    "Book a comprehensive mobile pre-purchase vehicle inspection with Auto Verifi — digital report with photos.",
  robots: { index: true, follow: true },
};

export default function PrePurchaseInspectionPage() {
  return <PrePurchaseSite />;
}
