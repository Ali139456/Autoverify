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
  const isVehicleInspections = pathname.startsWith("/vehicleinspections");

  if (isVehicleInspections) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-[76px] sm:pt-[80px]">{children}</main>
      <Footer />
    </>
  );
}
