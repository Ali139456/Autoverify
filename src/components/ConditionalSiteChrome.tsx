"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
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
  const isPreviewLogin = pathname === "/preview";
  const isComingSoonHome =
    pathname === "/" && comingSoonMode && !previewAccess;
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
