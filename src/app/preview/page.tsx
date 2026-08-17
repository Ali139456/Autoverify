import type { Metadata } from "next";
import { Suspense } from "react";
import { PreviewLoginForm } from "@/components/PreviewLoginForm";

export const metadata: Metadata = {
  title: "Preview Access",
  robots: { index: false, follow: false },
};

export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <PreviewLoginForm />
    </Suspense>
  );
}
