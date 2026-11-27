import type { Metadata } from "next";
import { SydneyPpiServicesIndexPage } from "@/components/sydney-pre-purchase/SydneyPpiServicesIndexPage";

export const metadata: Metadata = {
  title: "Vehicle inspection services | Sydney pre-purchase",
  description:
    "Mobile pre-purchase inspections for cars, utes, EVs, caravans and motorcycles across Sydney. One 100+ point standard, reported the same day.",
  alternates: { canonical: "/sydneyprepurchase/services" },
};

export default function SydneyPpiServicesIndexRoute() {
  return <SydneyPpiServicesIndexPage />;
}