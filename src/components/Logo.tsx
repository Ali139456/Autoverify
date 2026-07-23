import Image from "next/image";
import Link from "next/link";

const LOGO_SRC = "/logo/logo-inverse.png";
const LOGO_ASPECT = 2363 / 515;

type LogoProps = {
  className?: string;
  height?: number;
  priority?: boolean;
  linked?: boolean;
};

export function Logo({
  className = "",
  height = 36,
  priority = false,
  linked = true,
}: LogoProps) {
  const width = Math.round(height * LOGO_ASPECT);

  const image = (
    <Image
      src={LOGO_SRC}
      alt="Auto Verifi"
      width={width}
      height={height}
      priority={priority}
      className={`h-auto w-auto object-contain ${className}`}
      style={{ height, width: "auto", maxWidth: "min(220px, 50vw)" }}
    />
  );

  if (!linked) return image;

  return (
    <Link href="/" className="inline-flex shrink-0 items-center">
      {image}
    </Link>
  );
}
