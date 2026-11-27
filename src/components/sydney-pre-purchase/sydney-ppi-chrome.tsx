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

  const phoneDisplay = SYDNEY_PPI_PHONE.replace(/ /g, "\u00a0");

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#04070d]/90 backdrop-blur-md">
      <div
        className={`${PAGE_CONTAINER} grid h-[4.25rem] grid-cols-[auto_1fr_auto] items-center gap-3 sm:h-[4.5rem] sm:gap-4`}
      >
        <div className="min-w-0 justify-self-start">
          {onSydneyHome ? (
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent p-0"
              aria-label="Back to top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <Logo variant="onDark" height={36} linked={false} />
            </button>
          ) : (
            <Logo
              variant="onDark"
              height={36}
              href={SYDNEY_PPI_HOME}
              className="shrink-0"
            />
          )}
        </div>

        <nav
          aria-label="Sydney pre-purchase"
          className="hidden min-w-0 items-center justify-center gap-3 xl:gap-5 lg:flex"
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-[12.5px] font-medium leading-none text-slate-300 transition hover:text-white xl:text-[13.5px]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-2 sm:gap-2.5">
          <div className="hidden items-center gap-2 xl:gap-2.5 lg:flex">
            <Link
              href={SYDNEY_PPI_BOOK_HREF}
              className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-accent-500 px-4 text-[12.5px] font-bold leading-none text-white transition hover:bg-accent-600 xl:h-[2.375rem] xl:px-5 xl:text-[13.5px]"
            >
              Book inspection
            </Link>
            <a
              href={`mailto:${AUTOVERIFI_CONTACT_EMAIL}`}
              className="inline-flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-white/25 px-3.5 text-[12.5px] font-semibold leading-none text-white transition hover:border-white/50 xl:h-[2.375rem] xl:px-4 xl:text-[13.5px]"
            >
              Contact us
            </a>
            <a
              href={SYDNEY_PPI_PHONE_HREF}
              className="inline-flex items-center gap-1.5 whitespace-nowrap pl-0.5 text-[12.5px] font-semibold leading-none text-white xl:text-[13.5px]"
            >
              <Phone
                className="h-3.5 w-3.5 shrink-0 text-accent-400 xl:h-4 xl:w-4"
                aria-hidden
              />
              {phoneDisplay}
            </a>
          </div>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
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