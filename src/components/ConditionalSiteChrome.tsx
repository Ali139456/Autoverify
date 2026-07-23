"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { isComingSoonMode } from "@/lib/site-mode";

export function ConditionalSiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideMainFooter = pathname.startsWith("/vehicleinspections");
  const isComingSoonHome = pathname === "/" && isComingSoonMode();

  if (isComingSoonHome) {
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
