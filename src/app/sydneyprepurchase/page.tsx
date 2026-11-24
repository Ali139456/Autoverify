import type { Metadata } from "next";
import { SydneyPrePurchaseSite } from "@/components/sydney-pre-purchase/SydneyPrePurchaseSite";

export const metadata: Metadata = {
  title: "Sydney pre-purchase car inspection | Auto Verifi",
  description:
    "Mobile pre-purchase vehicle inspections across Sydney. Book online, pay securely with Stripe, and receive a photo-backed report the same day.",
  robots: { index: true, follow: true },
  alternates: {
    canonical: "/sydneyprepurchase",
  },
};

export default function SydneyPrePurchasePage() {
  return <SydneyPrePurchaseSite />;
}