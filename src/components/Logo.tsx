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
  /** auto, light, and dark all use the site accent blue lockup. */
  variant?: "auto" | "light" | "dark";
};

export function Logo({
  className = "",
  height = 48,
  maxWidth = "min(280px, 58vw)",
  priority = false,
  linked = true,
}: LogoProps) {
  const width = Math.round(height * LOGO_ASPECT);

  const image = (
    <span
      className={`inline-flex shrink-0 items-center ${className}`}
      style={{ height, maxWidth }}
    >
      <Image
        src="/logo/auto-verifi-accent.svg"
        alt="Auto Verifi"
        width={width}
        height={height}
        priority={priority}
        className="h-full w-auto max-w-full object-contain object-left"
      />
    </span>
  );

  if (!linked) return image;

  return (
    <Link href="/" className="inline-flex shrink-0 items-center">
      {image}
    </Link>
  );
}
