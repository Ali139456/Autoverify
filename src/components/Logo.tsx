import Image from "next/image";
import Link from "next/link";

const LOGO_ASPECT = 2363 / 515;

type LogoProps = {
  className?: string;
  height?: number;
  maxWidth?: string;
  priority?: boolean;
  linked?: boolean;
  /** auto = swap by theme class on html */
  variant?: "auto" | "light" | "dark";
};

export function Logo({
  className = "",
  height = 48,
  maxWidth = "min(280px, 58vw)",
  priority = false,
  linked = true,
  variant = "auto",
}: LogoProps) {
  const width = Math.round(height * LOGO_ASPECT);

  const image = (
    <span
      className={`inline-flex shrink-0 items-center ${className}`}
      style={{ height, maxWidth }}
    >
      {variant === "dark" ? (
        <Image
          src="/logo/logo-inverse.png"
          alt="Auto Verifi"
          width={width}
          height={height}
          priority={priority}
          className="h-full w-auto max-w-full object-contain object-left"
        />
      ) : variant === "light" ? (
        <Image
          src="/logo/logo-blue.png"
          alt="Auto Verifi"
          width={width}
          height={height}
          priority={priority}
          className="h-full w-auto max-w-full object-contain object-left"
        />
      ) : (
        <>
          <Image
            src="/logo/logo-blue.png"
            alt="Auto Verifi"
            width={width}
            height={height}
            priority={priority}
            className="h-full w-auto max-w-full object-contain object-left dark:hidden"
          />
          <Image
            src="/logo/logo-inverse.png"
            alt="Auto Verifi"
            width={width}
            height={height}
            priority={priority}
            className="hidden h-full w-auto max-w-full object-contain object-left dark:block"
          />
        </>
      )}
    </span>
  );

  if (!linked) return image;

  return (
    <Link href="/" className="inline-flex shrink-0 items-center">
      {image}
    </Link>
  );
}
