"use client";

import { useEffect } from "react";
import { scrollToVehicleSearch } from "@/lib/scroll-to-vehicle-search";

export function ScrollToCheckOnHash() {
  useEffect(() => {
    if (window.location.hash !== "#check") return;
    requestAnimationFrame(() => scrollToVehicleSearch());
  }, []);

  return null;
}
