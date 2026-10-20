/** Public support inbox shown on Contact and in the footer. */
export const AUTOVERIFI_CONTACT_EMAIL = "info@autoverifi.com.au";

export function getContactInboxEmail(): string {
  return (
    process.env.AUTOVERIFI_SUPPORT_EMAIL?.trim().toLowerCase() ??
    AUTOVERIFI_CONTACT_EMAIL
  );
}
