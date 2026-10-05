"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { homeCheckHref } from "@/lib/routes";
import { scrollToVehicleSearch } from "@/lib/scroll-to-vehicle-search";

type HomeCheckLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href?: ComponentProps<typeof Link>["href"];
};

export function HomeCheckLink({
  href: _href,
  onClick,
  ...props
}: HomeCheckLinkProps) {
  const pathname = usePathname();
  const href = homeCheckHref(pathname);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (pathname === "/" && href === "#check") {
      event.preventDefault();
      scrollToVehicleSearch();
    }
  }

  return <Link href={href} onClick={handleClick} {...props} />;
}
