import type { AustralianState } from "@/lib/types";
import { parseVehicleIdentifier } from "@/lib/vehicle-identifier";

const STATES: AustralianState[] = [
  "ACT",
  "NSW",
  "NT",
  "QLD",
  "SA",
  "TAS",
  "VIC",
  "WA",
];

export function parseLavAssetLookupInput(asset: {
  identifier: string;
  rego: string;
  state?: string;
}): { query: string; state?: AustralianState } | null {
  const id = asset.identifier.trim().toUpperCase();
  const parsedId = id ? parseVehicleIdentifier(id) : null;
  if (parsedId) {
    const state =
      asset.state && STATES.includes(asset.state as AustralianState)
        ? (asset.state as AustralianState)
        : parsedId.kind === "rego"
          ? undefined
          : "NSW";
    return { query: parsedId.value, state };
  }

  const regoRaw = asset.rego.trim().toUpperCase();
  if (!regoRaw) return null;

  const parts = regoRaw.split(/\s+/);
  let plate = regoRaw;
  let state: AustralianState | undefined;
  const last = parts[parts.length - 1];
  if (STATES.includes(last as AustralianState)) {
    state = last as AustralianState;
    plate = parts.slice(0, -1).join(" ");
  } else if (
    asset.state &&
    STATES.includes(asset.state.trim().toUpperCase() as AustralianState)
  ) {
    state = asset.state.trim().toUpperCase() as AustralianState;
  }

  const parsedPlate = parseVehicleIdentifier(plate);
  if (!parsedPlate || parsedPlate.kind !== "rego") {
    return null;
  }
  return { query: parsedPlate.value, state };
}
