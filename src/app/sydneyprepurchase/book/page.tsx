import { Suspense } from "react";
import { SydneyPrePurchaseBookPage } from "@/components/sydney-pre-purchase/SydneyPrePurchaseBookPage";

export const metadata = {
  title: "Book a pre-purchase inspection | Auto Verifi Sydney",
  description:
    "Request a mobile pre-purchase inspection for a car, ute, van, caravan or motorcycle in Sydney.",
};

export default function SydneyPrePurchaseBookRoute() {
  return (
    <Suspense fallback={null}>
      <SydneyPrePurchaseBookPage />
    </Suspense>
  );
}