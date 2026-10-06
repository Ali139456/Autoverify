"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { HomeCheckLink } from "@/components/HomeCheckLink";
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
  dark = false,
}: {
  onNavigate?: () => void;
  compact?: boolean;
  dark?: boolean;
}) {
  return (
    <>
      {INSPECTION_MENU_ITEMS.map((item) => {
        if ("status" in item) {
          return (
            <div
              key={item.label}
              className={`flex items-center justify-between gap-3 ${
                compact && dark
                  ? "rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400"
                  : compact
                    ? "rounded-xl px-4 py-3 text-sm font-medium text-slate-800"
                    : "px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  compact && dark
                    ? "border border-white/10 bg-white/5 text-slate-500"
                    : compact
                      ? "bg-slate-100 text-slate-600"
                      : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                }`}
              >
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
            className={`block transition ${
              compact && dark
                ? "rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5 hover:text-white"
                : compact
                  ? "rounded-xl px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50 hover:text-slate-950"
                  : "px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-white/5 dark:hover:text-white"
            }`}
          >
            {item.label}
          </a>
        );
      })}
    </>
  );
}

const mobileNavLinkClass =
  "group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-[15px] font-semibold tracking-tight text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:border-[#0073E3]/45 hover:bg-[#0073E3]/12 hover:text-white active:scale-[0.99]";

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
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`}
      >
        Inspections
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 min-w-[18rem] overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-ink-900/95 dark:shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
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

function HeaderMobileMenu({
  isInspectionPage,
  links,
}: {
  isInspectionPage: boolean;
  links: typeof MAIN_LINKS | typeof INSPECTION_PAGE_LINKS;
}) {
  const [open, setOpen] = useState(false);
  const [mobileInspectionsOpen, setMobileInspectionsOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-ink-800 text-slate-200 transition hover:bg-white/5 md:hidden"
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden />
        ) : (
          <Menu className="h-5 w-5" aria-hidden />
        )}
      </button>

      {open && (
        <div
          className="fixed inset-x-0 bottom-0 top-[5.75rem] z-[60] flex min-h-0 flex-col bg-gradient-to-b from-ink-950 via-ink-950 to-[#060b14] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(0,115,227,0.22),transparent_70%)]"
            aria-hidden
          />
          <nav className="relative flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4 pt-5">
            <p className="px-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#0073E3]">
              Navigate
            </p>
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={mobileNavLinkClass}
              >
                {l.label}
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-[#0073E3] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                  aria-hidden
                />
              </Link>
            ))}

            {!isInspectionPage && (
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => setMobileInspectionsOpen((value) => !value)}
                  className={`${mobileNavLinkClass} w-full ${
                    mobileInspectionsOpen
                      ? "border-[#0073E3]/50 bg-[#0073E3]/15 text-white"
                      : ""
                  }`}
                >
                  Inspections
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#0073E3] transition-transform ${
                      mobileInspectionsOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
                {mobileInspectionsOpen && (
                  <div className="mt-2 space-y-0.5 rounded-xl border border-white/10 bg-black/25 py-2 pl-3 pr-2 backdrop-blur-sm">
                    <InspectionMenuItems
                      compact
                      dark
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
          <div className="relative shrink-0 border-t border-white/10 bg-ink-950/90 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md">
            {isInspectionPage ? (
              <Link
                href="#contact"
                onClick={() => setOpen(false)}
                className="btn-shine group flex items-center justify-center gap-2 rounded-full bg-[#0073E3] px-5 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_rgba(0,115,227,0.35)] transition hover:bg-[#0062c2]"
              >
                Request an inspection
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            ) : (
              <HomeCheckLink
                onClick={() => setOpen(false)}
                className="btn-shine group flex items-center justify-center gap-2 rounded-full bg-[#0073E3] px-5 py-3.5 text-sm font-bold text-white shadow-[0_12px_40px_rgba(0,115,227,0.35)] transition hover:bg-[#0062c2]"
              >
                Buy Report
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </HomeCheckLink>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function Header() {
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

  return (
    <header className="av-site-header fixed inset-x-0 top-0 z-50 bg-ink-950 px-3 py-3 sm:px-6">
      <div
        className={`mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-3 rounded-2xl border border-white/10 bg-ink-900 px-3 transition-shadow duration-300 sm:px-4 ${
          scrolled
            ? "shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
            : "shadow-[0_2px_16px_rgba(0,0,0,0.35)]"
        }`}
      >
        <Logo height={48} priority variant="onDark" />

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-ink-800/80 p-1 md:flex">
          {links.map((l) => {
            const active = l.href === "/pricing" && pathname === "/pricing";
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-accent-500 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
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
            <HomeCheckLink className={buyReportClass}>
              Buy Report
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </HomeCheckLink>
          )}

          <HeaderMobileMenu
            key={pathname}
            isInspectionPage={isInspectionPage}
            links={links}
          />
        </div>
      </div>
    </header>
  );
}
