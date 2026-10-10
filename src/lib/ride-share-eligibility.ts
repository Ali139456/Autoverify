import type { VehicleIdentity, VehicleReport } from "./types";
import { resolveVehicleDoorAndSeatCounts } from "./vehicle-door-seats";

export type RideShareEligibilityRow = {
  requirement: string;
  uberX: string;
  didi: string;
};

export type RideShareQuickCheck = "eligible" | "ineligible" | "unknown";

export type RideShareQuickEligibility = {
  vehicleAgeYears: number | null;
  /** Calendar year used for age (build date year when known, else model year). */
  vehicleOriginYear: number | null;
  doors: number | null;
  passengers: number | null;
  ageCheck: RideShareQuickCheck;
  doorsCheck: RideShareQuickCheck;
  passengersCheck: RideShareQuickCheck;
  allEligible: boolean;
};

function parseYearFromBuildDateValue(value: string): number | null {
  const trimmed = value.trim();
  const dmy = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmy) {
    const year = Number(dmy[3]);
    return Number.isFinite(year) ? year : null;
  }
  const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) {
    const year = Number(ymd[1]);
    return Number.isFinite(year) ? year : null;
  }
  return null;
}

/** Prefer build date from the spec sheet; fall back to model year. */
export function resolveRideShareVehicleOriginYear(
  vehicle: VehicleIdentity,
  report?: Pick<VehicleReport, "vehicleSpec">,
): number | null {
  const rows = report?.vehicleSpec?.dataRows ?? [];
  const buildRow = rows.find(
    (row) => row.label.trim().toLowerCase() === "build date",
  );
  if (buildRow?.value) {
    const fromBuild = parseYearFromBuildDateValue(buildRow.value);
    if (fromBuild != null) return fromBuild;
  }
  return vehicle.year > 0 ? vehicle.year : null;
}

function evaluateAgeCheck(vehicleAgeYears: number | null): RideShareQuickCheck {
  if (vehicleAgeYears == null || vehicleAgeYears < 0) return "unknown";
  return vehicleAgeYears < 15 ? "eligible" : "ineligible";
}

function evaluateDoorsCheck(doors: number | null): RideShareQuickCheck {
  if (doors == null || Number.isNaN(doors)) return "unknown";
  return doors >= 4 ? "eligible" : "ineligible";
}

function evaluatePassengersCheck(passengers: number | null): RideShareQuickCheck {
  if (passengers == null || Number.isNaN(passengers)) return "unknown";
  return passengers > 4 && passengers < 7 ? "eligible" : "ineligible";
}

/** Page-1 quick checks (UberX/DiDi age, doors, passenger band). */
export function evaluateRideShareQuickEligibility(
  vehicle: VehicleIdentity,
  report?: Pick<VehicleReport, "vehicleSpec" | "createdAt">,
  referenceYear = new Date().getFullYear(),
): RideShareQuickEligibility {
  const vehicleOriginYear = resolveRideShareVehicleOriginYear(vehicle, report);
  const vehicleAgeYears =
    vehicleOriginYear != null ? referenceYear - vehicleOriginYear : null;
  const ageCheck = evaluateAgeCheck(vehicleAgeYears);

  const counts = resolveVehicleDoorAndSeatCounts(vehicle, report);
  const doors =
    counts.doors === "—" ? null : Number.parseInt(counts.doors, 10);
  const passengers =
    counts.passengers === "—" ? null : Number.parseInt(counts.passengers, 10);

  const doorsCheck = evaluateDoorsCheck(doors);
  const passengersCheck = evaluatePassengersCheck(passengers);

  return {
    vehicleAgeYears,
    vehicleOriginYear,
    doors: doors != null && !Number.isNaN(doors) ? doors : null,
    passengers:
      passengers != null && !Number.isNaN(passengers) ? passengers : null,
    ageCheck,
    doorsCheck,
    passengersCheck,
    allEligible:
      ageCheck === "eligible" &&
      doorsCheck === "eligible" &&
      passengersCheck === "eligible",
  };
}

/** NSW ride-share platform requirements (information only — final eligibility set by each platform). */
export const RIDE_SHARE_ELIGIBILITY_ROWS: RideShareEligibilityRow[] = [
  {
    requirement: "Vehicle age",
    uberX: "15 years old or less",
    didi: "15 years old or less",
  },
  {
    requirement: "Doors",
    uberX: "Minimum 4 doors",
    didi: "Minimum 4 doors",
  },
  {
    requirement: "Passenger capacity",
    uberX: "4–7 passengers",
    didi: "4–6 passengers",
  },
  {
    requirement: "ANCAP safety rating",
    uberX: "5-Star ANCAP, unless covered by Uber exemption policy",
    didi: "No specific ANCAP rating stated in DiDi NSW requirements",
  },
  {
    requirement: "Registration",
    uberX:
      "Valid registration in the state/territory where the vehicle operates",
    didi:
      "Valid registration in the state/territory where the vehicle operates",
  },
  {
    requirement: "Compulsory Insurance",
    uberX:
      "Valid compulsory third-party (CTP) insurance applicable to the state/territory of operation",
    didi:
      "Valid compulsory third-party (CTP) insurance applicable to the state/territory of operation",
  },
  {
    requirement: "Vehicle Insurance",
    uberX: "Third-party property damage insurance or higher required",
    didi: "Third-party property damage or comprehensive insurance required",
  },
  {
    requirement: "Vehicle Inspection",
    uberX:
      "Must have a current Roadworthy inspection or equivalent in your State",
    didi:
      "Must have a current Roadworthy inspection or equivalent in your State",
  },
  {
    requirement: "Vehicle condition",
    uberX:
      "Excellent working condition; no cosmetic damage; working windows & A/C",
    didi:
      "Great/excellent condition; damage-free; working windows & A/C",
  },
  {
    requirement: "Commercial branding",
    uberX: "No commercial branding",
    didi: "No commercial branding/decals",
  },
  {
    requirement: "Ineligible vehicles",
    uberX:
      "Taxi/ex-taxi, government, ex-driving-school, branded or rebuilt vehicles",
    didi:
      "DiDi's general rules also exclude taxi, government, branded and rebuilt vehicles",
  },
];

export const RIDE_SHARE_TABLE_HEADING =
  "Ride share — eligibility requirements";
