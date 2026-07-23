"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

const MAIN_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#whats-included", label: "What's included" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

const INSPECTION_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#cofounders", label: "About us" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isInspectionPage = pathname.startsWith("/vehicleinspections");
  const links = isInspectionPage ? INSPECTION_LINKS : MAIN_LINKS;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
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
            const active =
              !isInspectionPage &&
              l.href === "/pricing" &&
              pathname === "/pricing";
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-accent-600/90 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {isInspectionPage ? (
            <Link
              href="#contact"
              className="group hidden items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-accent-600 to-accent-500 px-5 py-2.5 text-sm font-bold text-white transition hover:from-accent-500 hover:to-accent-400 sm:inline-flex"
            >
              Request an inspection
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          ) : (
            <Link
              href="/#check"
              className="group hidden items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-accent-600 to-accent-500 px-5 py-2.5 text-sm font-bold text-white transition hover:from-accent-500 hover:to-accent-400 sm:inline-flex"
            >
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
          </nav>
          {isInspectionPage ? (
            <Link
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 px-5 py-3.5 font-bold text-white"
            >
              Request an inspection
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <Link
              href="/#check"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-600 to-accent-500 px-5 py-3.5 font-bold text-white"
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
