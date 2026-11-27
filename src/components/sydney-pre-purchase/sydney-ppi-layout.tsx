import type { ReactNode } from "react";
import { PAGE_CONTAINER } from "./sydney-ppi-chrome";

/** Full-width Sydney PPI page shell (matches header/footer width). */
export function SydneyPpiPage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col overflow-x-clip bg-black text-white">
      {children}
    </div>
  );
}

/** Content band: full-bleed section background, inner width aligned to navbar. */
export function SydneyPpiSection({
  children,
  className = "",
  innerClassName = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`w-full min-w-0 ${className}`.trim()}
    >
      <div className={`${PAGE_CONTAINER} ${innerClassName}`.trim()}>
        {children}
      </div>
    </section>
  );
}