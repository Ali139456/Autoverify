import { normalizeAuMobile } from "./phone";

function formatSmsFailureMessage(raw: string, status: number): string {
  const normalized = raw.trim();
  if (
    status >= 500 ||
    /internal server error/i.test(normalized) ||
    normalized.length === 0
  ) {
    return "SMS could not be sent (Twilio error). Use the QR code to open the inspection link on the owner's phone.";
  }
  if (/unable to create record|not a valid phone number|invalid 'to'/i.test(normalized)) {
    return "SMS could not be sent — check the owner mobile number. You can still use the QR code.";
  }
  if (
    /not a twilio phone number|short code country mismatch|invalid 'from'/i.test(
      normalized,
    )
  ) {
    return "SMS could not be sent — the Twilio sender number is not valid for this account (check TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID in Vercel Production). Use the QR code to open the inspection link on the owner's phone.";
  }
  return normalized.length > 160 ? `${normalized.slice(0, 157)}…` : normalized;
}

function resolveTwilioFromNumber(): string | null {
  const raw = process.env.TWILIO_FROM_NUMBER?.trim();
  if (!raw) return null;
  if (raw.startsWith("+")) return raw;
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("61") && digits.length >= 11) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+61${digits.slice(1)}`;
  if (digits.length >= 9) return `+${digits}`;
  return null;
}

function resolveTwilioMessagingServiceSid(): string | null {
  const raw = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();
  if (!raw?.startsWith("MG")) return null;
  return raw;
}

function readTwilioCredentials(): {
  accountSid: string | null;
  authToken: string | null;
  from: string | null;
  messagingServiceSid: string | null;
} {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim() ?? null;
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim() ?? null;
  const from = resolveTwilioFromNumber();
  const messagingServiceSid = resolveTwilioMessagingServiceSid();
  return { accountSid, authToken, from, messagingServiceSid };
}

export type SmsSenderMode = "from" | "messaging_service" | null;

export function getSmsSenderMode(): SmsSenderMode {
  const { from, messagingServiceSid } = readTwilioCredentials();
  if (messagingServiceSid) return "messaging_service";
  if (from?.startsWith("+")) return "from";
  return null;
}

export function isSmsConfigured(): boolean {
  const { accountSid, authToken, from, messagingServiceSid } =
    readTwilioCredentials();
  const hasSender = Boolean(from?.startsWith("+") || messagingServiceSid);
  return Boolean(accountSid?.startsWith("AC") && authToken && hasSender);
}

export const SMS_NOT_CONFIGURED_MESSAGE =
  "SMS is not configured on this deployment. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and either TWILIO_FROM_NUMBER (Twilio-owned AU number in E.164) or TWILIO_MESSAGING_SERVICE_SID in Vercel → Settings → Environment Variables (Production), then redeploy.";

export async function sendInspectionLinkSms(input: {
  to: string;
  inspectUrl: string;
  vehicleLabel?: string;
}): Promise<{ to: string }> {
  if (!isSmsConfigured()) {
    throw new Error(SMS_NOT_CONFIGURED_MESSAGE);
  }

  const to = normalizeAuMobile(input.to);
  if (!to) {
    throw new Error("Please enter a valid Australian mobile number.");
  }

  const { accountSid, authToken, from, messagingServiceSid } =
    readTwilioCredentials();
  const vehicle = input.vehicleLabel ? ` for ${input.vehicleLabel}` : "";

  const body = `Auto Verifi: complete the AI condition check${vehicle} on your phone:\n${input.inspectUrl}`;

  const params = new URLSearchParams({ To: to, Body: body });
  if (messagingServiceSid) {
    params.set("MessagingServiceSid", messagingServiceSid);
  } else {
    params.set("From", from!);
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | { message?: string; error_message?: string }
    | null;

  if (!response.ok) {
    const raw =
      payload?.message || payload?.error_message || `SMS failed (${response.status}).`;
    throw new Error(formatSmsFailureMessage(raw, response.status));
  }

  return { to };
}
