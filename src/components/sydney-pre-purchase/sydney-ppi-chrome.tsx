"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { AUTOVERIFI_CONTACT_EMAIL } from "@/lib/site-contact";
import {
  SYDNEY_PPI_PHONE,
  SYDNEY_PPI_PHONE_HREF,
} from "@/lib/pre-purchase/sydney-landing-content";
import {
  SYDNEY_PPI_BOOK_HREF,
  sydneyPpiServiceHref,
} from "@/lib/pre-purchase/sydney-ppi-paths";
export const PAGE_CONTAINER =
  "mx-auto w-full max-w-[82rem] px-5 sm:px-8 lg:px-10 xl:px-12";

export function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

const SYDNEY_PPI_HOME = "/sydneyprepurchase";

const NAV_LINKS = [
  { href: SYDNEY_PPI_HOME, label: "Pre Purchase Inspections" },
  { href: `${SYDNEY_PPI_HOME}#what-we-check`, label: "What we check" },
  { href: `${SYDNEY_PPI_HOME}#how-it-works`, label: "How it works" },
  { href: `${SYDNEY_PPI_HOME}#about-report`, label: "About" },
] as const;

export function SydneyPpiHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onSydneyHome = pathname === SYDNEY_PPI_HOME;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#04070d]/90 backdrop-blur-md">
      <div
        className={`${PAGE_CONTAINER} flex items-center justify-between gap-4 py-4 lg:py-[1.125rem]`}
      >
        {onSydneyHome ? (
          <button
            type="button"
            className="shrink-0 cursor-pointer border-0 bg-transparent p-0"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <Logo variant="onDark" height={42} linked={false} />
          </button>
        ) : (
          <Logo
            variant="onDark"
            height={42}
            href={SYDNEY_PPI_HOME}
            className="shrink-0"
          />
        )}

        <nav className="hidden items-center gap-7 xl:gap-8 lg:flex">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[15px] font-medium text-slate-300 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Link
            href={SYDNEY_PPI_BOOK_HREF}
            className="inline-flex h-10 items-center rounded-full bg-accent-500 px-5 text-[15px] font-bold text-white transition hover:bg-accent-600"
          >
            Book inspection
          </Link>
          <a
            href={`mailto:${AUTOVERIFI_CONTACT_EMAIL}`}
            className="inline-flex h-10 items-center rounded-full border border-white/25 px-5 text-[15px] font-semibold text-white transition hover:border-white/50"
          >
            Contact us
          </a>
          <a
            href={SYDNEY_PPI_PHONE_HREF}
            className="inline-flex items-center gap-2 pl-1 text-[15px] font-semibold text-white"
          >
            <Phone className="h-[1.125rem] w-[1.125rem] text-accent-400" aria-hidden />
            {SYDNEY_PPI_PHONE}
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[#04070d] px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-left text-sm font-medium text-slate-200"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={SYDNEY_PPI_PHONE_HREF}
              className="text-sm font-semibold text-white"
            >
              {SYDNEY_PPI_PHONE}
            </a>
            <Link
              href={SYDNEY_PPI_BOOK_HREF}
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-10 items-center justify-center rounded-full bg-accent-500 text-sm font-bold text-white"
            >
              Book inspection
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

const FOOTER_INSPECTION_LINKS = [
  { slug: "cars", label: "Passenger vehicles inspection" },
  { slug: "light-commercial", label: "Utes, vans & 4WDs inspection" },
  { slug: "electric-vehicles", label: "Electric vehicles inspection" },
  { slug: "caravans", label: "Caravans inspection" },
  { slug: "motorcycles", label: "Motorcycles inspection" },
] as const;

export function SydneyPpiFooter() {
  return (
    <footer className="border-t border-white/10 bg-black py-12 sm:py-14">
      <div className={PAGE_CONTAINER}>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          <div className="min-w-0 space-y-4">
            <Logo variant="onDark" height={36} linked={false} />
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              Independent mobile pre-purchase inspections for cars, light
              commercial vehicles, caravans and motorcycles. We travel to the
              vehicle and report the same day.
            </p>
            <Link
              href={SYDNEY_PPI_BOOK_HREF}
              className="text-sm font-semibold text-accent-400 transition hover:text-accent-300"
            >
              Book inspection
            </Link>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Pre purchase inspections
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              {FOOTER_INSPECTION_LINKS.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={sydneyPpiServiceHref(item.slug)}
                    className="transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Company
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <Link
                  href="/sydneyprepurchase#what-we-check"
                  className="transition hover:text-white"
                >
                  What we check
                </Link>
              </li>
              <li>
                <Link
                  href="/sydneyprepurchase#how-it-works"
                  className="transition hover:text-white"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/sydneyprepurchase#about-report"
                  className="transition hover:text-white"
                >
                  About us
                </Link>
              </li>
              <li>
                <Link
                  href="/sydneyprepurchase#faq"
                  className="transition hover:text-white"
                >
                  Frequently asked questions
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${AUTOVERIFI_CONTACT_EMAIL}?subject=Sydney%20pre-purchase%20quote`}
                  className="transition hover:text-white"
                >
                  Request a quote
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 AUTOVERIFi. Independent vehicle inspections.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/terms" className="transition hover:text-slate-300">
              Terms of Service
            </Link>
            <Link href="/privacy" className="transition hover:text-slate-300">
              Privacy Policy
            </Link>
            <span className="hidden text-slate-600 sm:inline">|</span>
            <span>Servicing Sydney and surrounding regions.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}