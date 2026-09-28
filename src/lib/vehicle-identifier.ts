import { buildCheckUrl } from "./routes";
import type { AustralianState, ReportTier } from "./types";

/** Standard 17-character VIN (excludes I, O, Q). */
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

const REGO_PATTERN = /^[A-Z0-9]{1,9}$/;

export type VehicleIdentifier =
  | { kind: "vin"; value: string }
  | { kind: "rego"; value: string };

export function cleanVehicleIdentifier(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function isVin(value: string): boolean {
  return VIN_PATTERN.test(cleanVehicleIdentifier(value));
}

export function parseVehicleIdentifier(raw: string): VehicleIdentifier | null {
  const cleaned = cleanVehicleIdentifier(raw);
  if (VIN_PATTERN.test(cleaned)) {
    return { kind: "vin", value: cleaned };
  }
  if (REGO_PATTERN.test(cleaned)) {
    return { kind: "rego", value: cleaned };
  }
  return null;
}

export function formatVehicleIdentifierLabel(
  identifier: VehicleIdentifier,
  state?: AustralianState,
): string {
  if (identifier.kind === "vin") {
    return `VIN ${identifier.value}`;
  }
  return state ? `${identifier.value} (${state})` : identifier.value;
}

export function buildCheckSearchUrl(
  vehicle: {
    rego: string;
    vin: string;
    state: string;
  },
  options?: { tier?: ReportTier },
): string {
  if (vehicle.rego) {
    return buildCheckUrl({
      rego: vehicle.rego,
      state: vehicle.state,
      tier: options?.tier,
    });
  }
  if (vehicle.vin) {
    return buildCheckUrl({
      vin: vehicle.vin,
      state: vehicle.state,
      tier: options?.tier,
    });
  }
  return "/#check";
}
