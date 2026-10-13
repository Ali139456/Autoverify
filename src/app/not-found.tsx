import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";

export const metadata = {
  title: "Page not found",
  description: "The page you requested could not be found on Auto Verifi.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] w-full min-w-0 flex-col items-center justify-center px-5 py-16 text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0073E3]">
        404
      </p>
      <h1 className="mt-3 max-w-lg text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
        The link may be outdated or the page may have moved. Head back to check a
        vehicle or view pricing.
      </p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0073E3] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0062c2]"
        >
          <Home className="h-4 w-4" aria-hidden />
          Home
        </Link>
        <Link
          href="/#check"
          className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#0073E3] px-6 py-3 text-sm font-bold text-[#0073E3] transition hover:bg-[#0073E3]/5"
        >
          Buy report
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
