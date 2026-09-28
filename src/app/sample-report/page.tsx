import type { Metadata } from "next";
import { SampleReportLayout } from "@/components/report/SampleReportLayout";

export const metadata: Metadata = {
  title: "Sample Report — Auto Verifi Insights",
  description:
    "Preview an Auto Verifi Insights vehicle intelligence report — PPSR, valuation, market data and key vehicle checks.",
};

export default function SampleInsightsReportPage() {
  return <SampleReportLayout tier="insights" />;
}
