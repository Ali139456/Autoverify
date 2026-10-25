"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
export function ConditionalSiteChrome({
  children,
  previewAccess = false,
  comingSoonMode = true,
}: {
  children: React.ReactNode;
  previewAccess?: boolean;
  comingSoonMode?: boolean;
}) {
  const pathname = usePathname();
  const hideMainFooter = pathname.startsWith("/vehicleinspections");
  const isLenderAssetPage = pathname.startsWith(
    "/inspections/lender-asset-verification",
  );
  const isContactPage = pathname === "/contact";
  const hideFooterPurchaseCta =
    pathname.startsWith("/check") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/report/") ||
    pathname.startsWith("/sample-report") ||
    isContactPage ||
    isLenderAssetPage;
  const isPreviewLogin = pathname === "/preview";
  const isComingSoonHome =
    pathname === "/" && comingSoonMode && !previewAccess;
  const isInspectionApp = pathname.startsWith("/inspect/");

  if (isComingSoonHome || isInspectionApp || isPreviewLogin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <ThemeProvider>
      <Header />
      <main
        className={`flex-1 w-full min-w-0 overflow-x-clip pt-[5.75rem] sm:pt-[6rem] ${
          isContactPage || isLenderAssetPage
            ? "bg-ink-950"
            : "bg-white dark:bg-ink-950"
        }`}
      >
        {children}
      </main>
      {!hideMainFooter && (
        <Footer showPurchaseCta={!hideFooterPurchaseCta} />
      )}
    </ThemeProvider>
  );
}
