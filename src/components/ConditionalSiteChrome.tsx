"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export function ConditionalSiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideMainFooter = pathname.startsWith("/vehicleinspections");

  return (
    <>
      <Header />
      <main className="flex-1 pt-[76px] sm:pt-[80px]">{children}</main>
      {!hideMainFooter && <Footer />}
    </>
  );
}
