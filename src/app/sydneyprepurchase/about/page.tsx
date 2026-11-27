import type { Metadata } from "next";
import { SydneyPpiAboutPage } from "@/components/sydney-pre-purchase/SydneyPpiAboutPage";

export const metadata: Metadata = {
  title: "About us | Sydney pre-purchase inspections",
  description:
    "AUTOVERIFi Sydney pre-purchase inspections — decades of automotive expertise from Theo and Denise Cosmetatos.",
  alternates: { canonical: "/sydneyprepurchase/about" },
};

export default function SydneyPpiAboutRoute() {
  return <SydneyPpiAboutPage />;
}