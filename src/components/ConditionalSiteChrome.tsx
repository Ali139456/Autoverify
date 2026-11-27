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
  const isPrePurchasePage = pathname.startsWith("/inspections/pre-purchase");
  const isSydneyPpiSite = pathname.startsWith("/sydneyprepurchase");
  const hideFooterPurchaseCta =
    pathname.startsWith("/check") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/report/") ||
    pathname.startsWith("/sample-report") ||
    isContactPage ||
    isLenderAssetPage ||
    isPrePurchasePage ||
    isSydneyPpiSite;
  const isPreviewLogin = pathname === "/preview";
  const isAdminPage = pathname === "/admin";
  const isComingSoonHome =
    pathname === "/" && comingSoonMode && !previewAccess;
  const isInspectionApp = pathname.startsWith("/inspect/");

  if (
    isComingSoonHome ||
    isInspectionApp ||
    isPreviewLogin ||
    isAdminPage ||
    isSydneyPpiSite
  ) {
    return (
      <main className="flex-1 bg-black text-white">{children}</main>
    );
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
