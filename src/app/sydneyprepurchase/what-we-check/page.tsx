import type { Metadata } from "next";
import { SydneyPpiWhatWeCheckPage } from "@/components/sydney-pre-purchase/SydneyPpiWhatWeCheckPage";

export const metadata: Metadata = {
  title: "What a pre-purchase inspection covers | Sydney",
  description:
    "The full 100+ point pre-purchase checklist: body and paint, mechanical, chassis, brakes, electrics, diagnostics, compliance and road test.",
  alternates: { canonical: "/sydneyprepurchase/what-we-check" },
};

export default function SydneyPpiWhatWeCheckRoute() {
  return <SydneyPpiWhatWeCheckPage />;
}