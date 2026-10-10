import type { RegistrationInfo } from "./types";

/** Compare calendar dates in local time (expiry valid through end of expiry day). */
export function isRegistrationExpiryPast(
  expiryIso: string,
  referenceDate: Date = new Date(),
): boolean {
  const trimmed = expiryIso.trim();
  const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!ymd) return false;
  const expiryEnd = new Date(
    Number(ymd[1]),
    Number(ymd[2]) - 1,
    Number(ymd[3]),
    23,
    59,
    59,
    999,
  );
  const refStart = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    0,
    0,
    0,
    0,
  );
  return expiryEnd.getTime() < refStart.getTime();
}

/** When expiry is before today, treat “Registered” as expired (RTA / Service NSW). */
export function applyRegistrationExpiryInference(
  registration: RegistrationInfo,
  referenceDate: Date = new Date(),
): RegistrationInfo {
  const expiry = registration.expiryDate?.trim();
  if (!expiry) return registration;
  if (registration.status !== "Registered") return registration;
  if (!isRegistrationExpiryPast(expiry, referenceDate)) return registration;
  return { ...registration, status: "Expired" };
}

export function registrationDisplayStatus(
  registration: RegistrationInfo,
): string {
  if (registration.status === "Registered") return "Active";
  return registration.status;
}
