"use client";

import { useEffect, useRef, useState } from "react";

const CANVAS_WIDTH = 1440;
/** Matches cropped integrations graphic (legend footer removed). */
const CANVAS_HEIGHT = 1000;

export function IntegrationsEcosystemGraphic({ src }: { src: string }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const update = () => {
      const width = el.getBoundingClientRect().width;
      if (width > 0) {
        setScale(Math.min(1, width / CANVAS_WIDTH));
      }
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const frameHeight = CANVAS_HEIGHT * scale;

  return (
    <div
      ref={shellRef}
      className="integrations-ecosystem-graphic-shell mx-auto w-full max-w-5xl px-1 sm:max-w-6xl"
    >
      <div
        className="relative w-full overflow-hidden"
        style={{ height: frameHeight }}
      >
        <iframe
          src={src}
          title="Auto Verifi vehicle intelligence hub connected to marketplaces, lenders, insurers, FMOs, dealers, auction houses, car rental, car share and ride share"
          className="integrations-ecosystem-graphic absolute left-0 top-0 border-0 bg-transparent"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          loading="lazy"
          referrerPolicy="no-referrer"
          scrolling="no"
        />
      </div>
    </div>
  );
}
