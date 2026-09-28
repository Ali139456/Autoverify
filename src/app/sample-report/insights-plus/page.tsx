import type { Metadata } from "next";
import { SampleReportLayout } from "@/components/report/SampleReportLayout";

export const metadata: Metadata = {
  title: "Sample Report — Auto Verifi Insights+",
  description:
    "Preview an Auto Verifi Insights+ report with AI condition insights and predicted future valuation.",
};

export default function SampleInsightsPlusReportPage() {
  return <SampleReportLayout tier="insights_plus" />;
}
