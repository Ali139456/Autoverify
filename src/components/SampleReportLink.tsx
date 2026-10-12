import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { getSampleReportHref, isExternalHref } from "@/lib/sample-report";
import type { ReportTier } from "@/lib/types";

type SampleReportLinkProps = {
  tier?: ReportTier;
  variant?: "text" | "outline" | "hero";
  className?: string;
  /** Override default "Sample Report" label (hero row uses tier-specific text). */
  label?: string;
};

const baseText =
  "inline-flex items-center justify-center gap-1.5 text-sm font-bold text-[#0073E3] transition hover:text-[#0062c2] hover:underline";

export function SampleReportLink({
  tier = "insights",
  variant = "text",
  className = "",
  label: labelProp,
}: SampleReportLinkProps) {
  const href = getSampleReportHref(tier);
  const external = isExternalHref(href);
  const label = labelProp?.trim() || "Sample Report";

  if (variant === "hero") {
    return (
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={`group flex h-10 min-w-0 items-center justify-center gap-0.5 rounded-lg border-2 border-[#0073E3] bg-transparent px-2.5 text-center text-xs font-bold leading-tight text-[#0073E3] transition hover:bg-[#0073E3]/10 sm:gap-1.5 sm:px-4 sm:text-sm ${className}`}
      >
        <span className="min-w-0">{label}</span>
        <ArrowRight
          className="hidden h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 sm:inline sm:h-4 sm:w-4"
          aria-hidden
        />
      </Link>
    );
  }

  if (variant === "outline") {
    return (
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#0073E3] bg-white px-6 py-3 text-sm font-bold text-[#0073E3] transition hover:bg-[#0073E3]/5 dark:bg-transparent dark:hover:bg-[#0073E3]/10 sm:text-base ${className}`}
      >
        <FileText className="h-4 w-4 shrink-0" aria-hidden />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`${baseText} ${className}`}
    >
      <FileText className="h-4 w-4 shrink-0" aria-hidden />
      {label}
      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
    </Link>
  );
}
