import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/logo/logo-white.png";
const LOGO_ASPECT = 2363 / 515;

type LogoProps = {
  className?: string;
  height?: number;
  priority?: boolean;
  linked?: boolean;
};

export function Logo({
  className = "",
  height = 28,
  priority = false,
  linked = true,
}: LogoProps) {
  const width = Math.round(height * LOGO_ASPECT);

  const brand = (
    <span className="inline-flex shrink-0 items-center rounded-lg bg-[#1d4ed8] px-3 py-2">
      <Image
        src={LOGO_SRC}
        alt="Auto Verifi"
        width={width}
        height={height}
        priority={priority}
        className={`h-auto w-auto object-contain ${className}`}
        style={{ height, width: "auto", maxWidth: "min(160px, 42vw)" }}
      />
    </span>
  );

  if (!linked) return brand;

  return (
    <Link href="/" className="inline-flex shrink-0 items-center">
      {brand}
    </Link>
  );
}
