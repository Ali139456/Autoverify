import type { Metadata } from "next";
import { ComingSoon } from "@/components/ComingSoon";
import { HomePage } from "@/components/HomePage";
import { isComingSoonMode } from "@/lib/site-mode";

export const metadata: Metadata = isComingSoonMode()
  ? {
      title: "Auto Verifi — Coming Soon",
      description:
        "Auto Verifi is launching soon. Contact us at info@autoverifi.com.au.",
      robots: { index: true, follow: true },
    }
  : {
      title:
        "Auto Verifi — Car History Check, PPSR & AI Vehicle Reports Australia",
      description:
        "Instant car history checks for Australia. PPSR, finance owing, write-off and stolen checks plus live market valuation and AI-powered future value insights.",
    };

export default function Page() {
  if (isComingSoonMode()) {
    return <ComingSoon />;
  }

  return <HomePage />;
}
