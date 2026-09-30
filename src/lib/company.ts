export type CompanyDetails = {
  legalName: string;
  abn: string;
  address: string;
  email: string;
  website: string;
  websiteUrl: string;
};

export function getCompanyDetails(baseUrl?: string): CompanyDetails {
  const websiteUrl =
    baseUrl?.replace(/\/$/, "") ?? "https://www.autoverifi.com.au";
  return {
    legalName:
      process.env.AUTOVERIFI_COMPANY_NAME?.trim() ?? "Auto Verifi Pty Ltd",
    abn: process.env.AUTOVERIFI_ABN?.trim() ?? "76 692 062 061",
    address:
      process.env.AUTOVERIFI_ADDRESS?.trim() ??
      "Level 35, 100 Barangaroo Avenue, Sydney NSW 2000",
    email:
      process.env.AUTOVERIFI_SUPPORT_EMAIL?.trim() ?? "info@autoverifi.com.au",
    website: "www.autoverifi.com.au",
    websiteUrl,
  };
}

export function formatCompanyFooterLines(details: CompanyDetails): string[] {
  const lines = [details.legalName];
  if (details.abn) lines.push(`ABN ${details.abn}`);
  lines.push(details.address);
  lines.push(details.email);
  lines.push(details.website);
  return lines;
}
