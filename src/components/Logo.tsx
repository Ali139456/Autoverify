import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/logo/logo-inverse.png";
const LOGO_ASPECT = 2363 / 515;

type LogoProps = {
  className?: string;
  height?: number;
  maxWidth?: string;
  priority?: boolean;
  linked?: boolean;
};

export function Logo({
  className = "",
  height = 36,
  maxWidth = "min(220px, 50vw)",
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
        src={LOGO_SRC}
        alt="Auto Verifi"
        width={width}
        height={height}
        priority={priority}
        className="object-contain"
        style={{ width: "auto", height: "auto", maxHeight: "100%", maxWidth: "100%" }}
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
