import type { Metadata } from "next";
import { AboutUsSection } from "@/components/AboutUsSection";

export const metadata: Metadata = {
  title: "About us — Auto Verifi",
  description:
    "Meet the Auto Verifi founders and learn how decades of automotive expertise powers independent vehicle intelligence.",
};

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-ink-950">
      <AboutUsSection />
    </div>
  );
}
