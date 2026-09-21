/** Normalize Australian mobile numbers to E.164 (+614xxxxxxxx). */
export function normalizeAuMobile(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("61") && digits.length === 11) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return `+61${digits.slice(1)}`;
  }
  if (digits.length === 9 && /^[4-5]/.test(digits)) {
    return `+61${digits}`;
  }

  return input.trim().startsWith("+") ? input.trim() : null;
}

export function isValidAuMobile(input: string): boolean {
  return normalizeAuMobile(input) !== null;
}
