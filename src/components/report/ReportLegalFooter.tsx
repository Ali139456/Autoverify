import { Logo } from "@/components/Logo";
import { formatAbnDisplay, getCompanyDetails } from "@/lib/company";
import {
  REPORT_DISCLAIMER_CLOSING,
  REPORT_DISCLAIMER_LEAD,
} from "@/lib/report-disclaimer";

export function ReportLegalFooter() {
  const company = getCompanyDetails();

  return (
    <section
      className="report-legal-footer mt-6 overflow-hidden rounded-2xl bg-[#0f172a] px-6 py-7 text-slate-400 sm:px-8 sm:py-8"
      aria-label="Report disclaimer and company details"
    >
      <Logo height={40} linked={false} variant="onDark" />
      <p className="mt-5 w-full text-xs leading-relaxed text-slate-400">
        {REPORT_DISCLAIMER_LEAD}
      </p>
      <p className="mt-2 w-full text-xs leading-relaxed text-slate-400">
        {REPORT_DISCLAIMER_CLOSING}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-slate-400">
        {company.legalName}
        <br />
        ABN {formatAbnDisplay(company.abn)}
        <br />
        {company.address}
        <br />
        {company.email}
        <br />
        {company.website}
      </p>
    </section>
  );
}
