import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ComingSoon } from "@/components/ComingSoon";
import { HomePage } from "@/components/HomePage";
import { isComingSoonMode } from "@/lib/site-mode";
import { hasPreviewAccess, PREVIEW_COOKIE_NAME } from "@/lib/site-preview";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const previewToken = cookieStore.get(PREVIEW_COOKIE_NAME)?.value;
  const preview = await hasPreviewAccess(previewToken);

  if (isComingSoonMode() && !preview) {
    return {
      title: "Auto Verifi — Launching Soon",
      description: "Auto Verifi is launching soon.",
      robots: { index: true, follow: true },
    };
  }

  return {
    title: "Auto Verifi — Car History Check, PPSR & AI Vehicle Reports Australia",
    description:
      "Instant car history checks for Australia. PPSR, finance owing, write-off and stolen checks plus live market valuation and AI-powered future value insights.",
  };
}

export default async function Page() {
  const cookieStore = await cookies();
  const previewToken = cookieStore.get(PREVIEW_COOKIE_NAME)?.value;
  const preview = await hasPreviewAccess(previewToken);

  if (isComingSoonMode() && !preview) {
    return <ComingSoon />;
  }

  return <HomePage />;
}
