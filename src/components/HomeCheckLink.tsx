"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { homeCheckHref } from "@/lib/routes";

type HomeCheckLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href?: ComponentProps<typeof Link>["href"];
};

export function HomeCheckLink({
  href: _href,
  ...props
}: HomeCheckLinkProps) {
  const pathname = usePathname();
  return <Link href={homeCheckHref(pathname)} {...props} />;
}
