import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { ComingSoon } from "@/components/ComingSoon";
import { HomePage } from "@/components/HomePage";
import { shouldShowComingSoonPage } from "@/lib/site-mode";
import { hasPreviewAccess, PREVIEW_COOKIE_NAME } from "@/lib/site-preview";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const previewToken = cookieStore.get(PREVIEW_COOKIE_NAME)?.value;
  const preview = await hasPreviewAccess(previewToken);
  const host = headerStore.get("host");

  if (shouldShowComingSoonPage(host, preview)) {
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
  const headerStore = await headers();
  const previewToken = cookieStore.get(PREVIEW_COOKIE_NAME)?.value;
  const preview = await hasPreviewAccess(previewToken);
  const host = headerStore.get("host");

  if (shouldShowComingSoonPage(host, preview)) {
    return <ComingSoon />;
  }

  return <HomePage />;
}
