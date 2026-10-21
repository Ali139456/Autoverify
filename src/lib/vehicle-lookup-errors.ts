export type VehicleLookupMismatchKind =
  | "non_car_asset"
  | "reduced_confidence"
  | "unsupported_asset_category";

export type VehicleLookupMismatchDetails = {
  upstreamVehicle?: string;
  confidence?: string;
  vehicleCategory?: string;
  requestedCategory?: string;
};

export class VehicleLookupMismatchError extends Error {
  readonly kind: VehicleLookupMismatchKind;
  readonly details: VehicleLookupMismatchDetails;

  constructor(
    kind: VehicleLookupMismatchKind,
    message: string,
    details: VehicleLookupMismatchDetails = {},
  ) {
    super(message);
    this.name = "VehicleLookupMismatchError";
    this.kind = kind;
    this.details = details;
  }
}

export function isVehicleLookupMismatchError(
  err: unknown,
): err is VehicleLookupMismatchError {
  return err instanceof VehicleLookupMismatchError;
}
