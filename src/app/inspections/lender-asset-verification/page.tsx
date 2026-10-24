import type { Metadata } from "next";
import { LenderAssetVerificationSite } from "@/components/lender-asset-verification/LenderAssetVerificationSite";

export const metadata: Metadata = {
  title: "Lender Asset Verification",
  description:
    "Independent lender asset verification for cars and equipment — digital self-inspection or physical inspection, Australia-wide.",
  robots: { index: true, follow: true },
};

export default function LenderAssetVerificationPage() {
  return <LenderAssetVerificationSite />;
}
