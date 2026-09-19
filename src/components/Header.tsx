"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { INSPECTION_MENU_ITEMS } from "@/lib/inspection-menu";

const MAIN_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#whats-included", label: "What's included" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#about", label: "About us" },
  { href: "/#faq", label: "FAQ" },
] as const;

const INSPECTION_PAGE_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#cofounders", label: "About us" },
  { href: "#contact", label: "Contact" },
];

const buyReportClass =
  "group hidden items-center gap-2 whitespace-nowrap rounded-full bg-accent-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-600 sm:inline-flex";

function InspectionMenuItems({
  onNavigate,
  compact = false,
}: {
  onNavigate?: () => void;
  compact?: boolean;
}) {
  return (
    <>
      {INSPECTION_MENU_ITEMS.map((item) => {
        if ("status" in item) {
          return (
            <div
              key={item.label}
              className={`flex items-center justify-between gap-3 ${
                compact
                  ? "rounded-xl px-4 py-3 text-sm text-slate-300"
                  : "px-4 py-2.5 text-sm text-slate-200"
              }`}
            >
              <span>{item.label}</span>
              <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Coming soon
              </span>
            </div>
          );
        }

        return (
          <a
            key={item.label}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            onClick={onNavigate}
            className={`block transition hover:bg-white/5 hover:text-white ${
              compact
                ? "rounded-xl px-4 py-3 text-sm text-slate-200"
                : "px-4 py-2.5 text-sm text-slate-200"
            }`}
          >
            {item.label}
          </a>
        );
      })}
    </>
  );
}

function InspectionsDropdown({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
          open
            ? "bg-accent-500 text-white"
            : "text-slate-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        Inspections
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-[18rem] overflow-hidden rounded-2xl border border-white/10 bg-ink-900/95 py-2 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <InspectionMenuItems
            onNavigate={() => {
              setOpen(false);
              onNavigate?.();
            }}
          />
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [mobileInspectionsOpen, setMobileInspectionsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isInspectionPage = pathname.startsWith("/vehicleinspections");
  const links = isInspectionPage ? INSPECTION_PAGE_LINKS : MAIN_LINKS;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMobileInspectionsOpen(false);
  }, [pathname]);

  return (
    <header className="av-site-header fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <div
        className={`mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 rounded-2xl border px-3 backdrop-blur-2xl transition-all duration-300 sm:px-4 ${
          scrolled
            ? "border-white/15 bg-ink-900/75 shadow-[0_10px_40px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)]"
            : "border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        }`}
      >
        <Logo height={36} priority />

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:flex">
          {links.map((l) => {
            const active = l.href === "/pricing" && pathname === "/pricing";
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-accent-500 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          {!isInspectionPage && <InspectionsDropdown />}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {isInspectionPage ? (
            <Link href="#contact" className={buyReportClass}>
              Request an inspection
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          ) : (
            <Link href="/#check" className={buyReportClass}>
              Buy Report
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 md:hidden"
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-white/10 bg-ink-900/90 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </Link>
            ))}

            {!isInspectionPage && (
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => setMobileInspectionsOpen((value) => !value)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-slate-200 transition hover:bg-white/5 hover:text-white"
                >
                  Inspections
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      mobileInspectionsOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
                {mobileInspectionsOpen && (
                  <div className="mt-1 border-t border-white/10 pt-1">
                    <InspectionMenuItems
                      compact
                      onNavigate={() => {
                        setOpen(false);
                        setMobileInspectionsOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </nav>
          {isInspectionPage ? (
            <Link
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3.5 font-bold text-white hover:bg-accent-600"
            >
              Request an inspection
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <Link
              href="/#check"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3.5 font-bold text-white hover:bg-accent-600"
            >
              Buy Report
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
