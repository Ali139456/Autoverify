"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { isComingSoonMode } from "@/lib/site-mode";

export function ConditionalSiteChrome({
  children,
  previewAccess = false,
}: {
  children: React.ReactNode;
  previewAccess?: boolean;
}) {
  const pathname = usePathname();
  const hideMainFooter = pathname.startsWith("/vehicleinspections");
  const isPreviewLogin = pathname === "/preview";
  const isComingSoonHome =
    pathname === "/" && isComingSoonMode() && !previewAccess;
  const isInspectionApp = pathname.startsWith("/inspect/");

  if (isComingSoonHome || isInspectionApp || isPreviewLogin) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-[76px] sm:pt-[80px]">{children}</main>
      {!hideMainFooter && <Footer />}
    </>
  );
}
