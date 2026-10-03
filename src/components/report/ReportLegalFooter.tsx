import { Logo } from "@/components/Logo";
import { formatAbnDisplay, getCompanyDetails } from "@/lib/company";

const DISCLAIMER =
  "This report is compiled from third-party data sources and is provided for information only. It is not personal financial, legal or tax advice. You should make your own enquiries before purchasing a vehicle.";

export function ReportLegalFooter() {
  const company = getCompanyDetails();

  return (
    <section
      className="report-legal-footer mt-6 overflow-hidden rounded-2xl bg-[#0f172a] px-6 py-7 text-slate-400 sm:px-8 sm:py-8"
      aria-label="Report disclaimer and company details"
    >
      <Logo height={40} linked={false} variant="onDark" />
      <p className="mt-5 max-w-3xl text-xs leading-relaxed text-slate-400">
        {DISCLAIMER}
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
