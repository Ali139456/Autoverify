/**
 * Allowlist for server-side fetches of PPSR certificate PDFs (SSRF mitigation).
 * URLs come from AutoGrab / AFSA, not user input, but stored data could be tampered.
 */
const PPSR_CERTIFICATE_HOST_SUFFIXES = [
  "ppsr.gov.au",
  "afsa.gov.au",
  "autograb.com.au",
  "amazonaws.com",
] as const;

export function isAllowedPpsrCertificateUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return PPSR_CERTIFICATE_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`),
    );
  } catch {
    return false;
  }
}
