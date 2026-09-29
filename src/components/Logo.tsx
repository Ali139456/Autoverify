import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

/** Cropped accent SVG lockup (viewBox 560×90). */
const LOGO_ASPECT = 560 / 90;

type LogoProps = {
  className?: string;
  height?: number;
  maxWidth?: string;
  priority?: boolean;
  linked?: boolean;
  /**
   * onLight — all-blue wordmark (light backgrounds).
   * onDark — blue AUTO + white VERIFI (dark header/footer).
   * auto — both, toggled with `dark:` (footer light/dark mode).
   */
  variant?: "onLight" | "onDark" | "auto";
};

export function Logo({
  className = "",
  height = 48,
  maxWidth = "min(280px, 58vw)",
  priority = false,
  linked = true,
  variant = "onLight",
}: LogoProps) {
  const width = Math.round(height * LOGO_ASPECT);

  const renderLockup = (src: string, extraClass = "") => (
    <span
      className={`inline-flex shrink-0 items-center ${className} ${extraClass}`.trim()}
      style={{ height, maxWidth }}
    >
      <Image
        src={src}
        alt="Auto Verifi"
        width={width}
        height={height}
        priority={priority}
        style={{ width: "auto", height: "100%" }}
        className="max-w-full object-contain object-left"
      />
    </span>
  );

  let image: ReactNode;

  if (variant === "onDark") {
    image = renderLockup("/logo/auto-verifi-on-dark.svg");
  } else if (variant === "auto") {
    image = (
      <>
        {renderLockup("/logo/auto-verifi-accent.svg", "dark:hidden")}
        {renderLockup("/logo/auto-verifi-on-dark.svg", "hidden dark:inline-flex")}
      </>
    );
  } else {
    image = renderLockup("/logo/auto-verifi-accent.svg");
  }

  if (!linked) return image;

  return (
    <Link href="/" className="inline-flex shrink-0 items-center">
      {image}
    </Link>
  );
}
