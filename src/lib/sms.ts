function normalizeAuPhone(input: string): string | null {
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

export function isSmsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER,
  );
}

export async function sendInspectionLinkSms(input: {
  to: string;
  inspectUrl: string;
  vehicleLabel?: string;
}): Promise<{ to: string }> {
  if (!isSmsConfigured()) {
    throw new Error(
      "SMS is not configured yet. Add Twilio credentials to send inspection links by text.",
    );
  }

  const to = normalizeAuPhone(input.to);
  if (!to) {
    throw new Error("Please enter a valid Australian mobile number.");
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_FROM_NUMBER!;
  const vehicle = input.vehicleLabel ? ` for ${input.vehicleLabel}` : "";

  const body = `Auto Verifi: complete the AI condition check${vehicle} on your phone:\n${input.inspectUrl}`;

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: from,
        Body: body,
      }),
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; error_message?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      payload?.message || payload?.error_message || `SMS failed (${response.status}).`,
    );
  }

  return { to };
}
