"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { RegoSearchForm } from "@/components/RegoSearchForm";

function buildGuideArrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): { curve: string; head: string } {
  const dy = y2 - y1;
  const dx = x2 - x1;
  const leftSweep = Math.min(88, Math.max(44, dy * 0.38 + Math.abs(dx) * 0.12));
  const cp1x = x1 - leftSweep;
  const cp1y = y1 + Math.min(dy * 0.26, dy - 40);
  const cp2x = x2 - 22;
  const cp2y = Math.max(y1 + 16, y2 - 10);
  const curve = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  const angle = Math.atan2(y2 - cp2y, x2 - cp2x);
  const len = 11;
  const spread = 0.5;
  const ax = x2 - len * Math.cos(angle - spread);
  const ay = y2 - len * Math.sin(angle - spread);
  const bx = x2 - len * Math.cos(angle + spread);
  const by = y2 - len * Math.sin(angle + spread);
  const head = `M ${ax} ${ay} L ${x2} ${y2} L ${bx} ${by}`;
  return { curve, head };
}

export function HeroCheckLead() {
  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLSpanElement>(null);
  const endRef = useRef<HTMLSpanElement>(null);
  const [arrow, setArrow] = useState<{
    w: number;
    h: number;
    curve: string;
    head: string;
  } | null>(null);

  useLayoutEffect(() => {
    function measure() {
      const container = containerRef.current;
      const start = startRef.current;
      const end = endRef.current;
      if (!container || !start || !end) return;

      const cr = container.getBoundingClientRect();
      const sr = start.getBoundingClientRect();
      const er = end.getBoundingClientRect();

      const x1 = sr.left + sr.width * 0.42 - cr.left;
      const y1 = sr.top - cr.top + sr.height * 0.62 - 8;
      const x2 = er.left + er.width / 2 - cr.left;
      const y2 = er.top + er.height / 2 - cr.top;

      const { curve, head } = buildGuideArrow(x1, y1, x2, y2);
      setArrow({ w: cr.width, h: cr.height, curve, head });
    }

    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-w-0 overflow-visible text-center lg:text-left"
    >
      <h1 className="animate-fade-up delay-100 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
        Know what
        <br />
        you&apos;re buying.
      </h1>
      <p className="text-gradient-blue animate-fade-up delay-200 mt-3 text-2xl font-extrabold tracking-tight sm:mt-4 sm:text-3xl lg:text-4xl">
        Past, Present and Future insights to buy with{" "}
        <span className="whitespace-nowrap">
          <span ref={startRef} className="relative inline-block">
            c
          </span>
          onfidence
        </span>
      </p>
      <div className="animate-fade-up delay-300 relative mx-auto mt-6 max-w-md sm:mt-8 lg:mx-0">
        <RegoSearchForm onDark heroArrowEndRef={endRef} />
      </div>

      {arrow ? (
        <svg
          className="pointer-events-none absolute left-0 top-0 z-30 hidden overflow-visible sm:block"
          width={arrow.w}
          height={arrow.h}
          viewBox={`0 0 ${arrow.w} ${arrow.h}`}
          fill="none"
          aria-hidden
        >
          <path
            d={arrow.curve}
            stroke="#0073E3"
            strokeWidth={3.5}
            strokeLinecap="round"
          />
          <path
            d={arrow.head}
            stroke="#0073E3"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </div>
  );
}
