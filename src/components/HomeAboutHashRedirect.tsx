"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/** Legacy homepage #about links → dedicated about page (Denise / Company nav). */
export function HomeAboutHashRedirect() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== "/") return;
    if (window.location.hash.toLowerCase() === "#about") {
      router.replace("/about");
    }
  }, [pathname, router]);

  return null;
}
