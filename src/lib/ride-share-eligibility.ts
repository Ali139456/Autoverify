import type { VehicleIdentity, VehicleReport } from "./types";
import { resolveVehicleDoorAndSeatCounts } from "./vehicle-door-seats";

export type RideShareEligibilityRow = {
  requirement: string;
  uberX: string;
  didi: string;
};

export type RideShareQuickEligibility = {
  vehicleAgeYears: number | null;
  doors: number | null;
  passengers: number | null;
  ageEligible: boolean;
  doorsEligible: boolean;
  passengersEligible: boolean;
  allEligible: boolean;
};

/** Page-1 quick checks (UberX/DiDi age, doors, passenger band). */
export function evaluateRideShareQuickEligibility(
  vehicle: VehicleIdentity,
  report?: Pick<VehicleReport, "vehicleSpec" | "createdAt">,
  referenceYear = new Date().getFullYear(),
): RideShareQuickEligibility {
  const vehicleAgeYears =
    vehicle.year > 0 ? referenceYear - vehicle.year : null;
  const ageEligible =
    vehicleAgeYears != null && vehicleAgeYears >= 0 && vehicleAgeYears < 15;

  const counts = resolveVehicleDoorAndSeatCounts(vehicle, report);
  const doors =
    counts.doors === "—" ? null : Number.parseInt(counts.doors, 10);
  const passengers =
    counts.passengers === "—" ? null : Number.parseInt(counts.passengers, 10);

  const doorsEligible = doors != null && !Number.isNaN(doors) && doors >= 4;
  const passengersEligible =
    passengers != null &&
    !Number.isNaN(passengers) &&
    passengers > 4 &&
    passengers < 7;

  return {
    vehicleAgeYears,
    doors: doors != null && !Number.isNaN(doors) ? doors : null,
    passengers:
      passengers != null && !Number.isNaN(passengers) ? passengers : null,
    ageEligible,
    doorsEligible,
    passengersEligible,
    allEligible: ageEligible && doorsEligible && passengersEligible,
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
  {
    requirement: "Final eligibility",
    uberX: "Determined by Uber",
    didi: "Determined by DiDi",
  },
];
