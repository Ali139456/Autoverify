import type { VehicleIdentity, VehicleReport } from "./types";

function formatVehicleCount(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return String(value);
}

export function resolveVehicleDoorAndSeatCounts(
  vehicle: VehicleIdentity,
  report?: Pick<VehicleReport, "vehicleSpec">,
): { doors: string; passengers: string } {
  let doors = vehicle.doors ?? null;
  let seats = vehicle.seats ?? null;
  const rows = report?.vehicleSpec?.dataRows ?? [];
  for (const row of rows) {
    if (doors == null && row.label === "Doors") {
      const parsed = Number(String(row.value).replace(/[^\d]/g, ""));
      if (Number.isFinite(parsed) && parsed > 0) doors = parsed;
    }
    if (seats == null && row.label === "Seats") {
      const parsed = Number(String(row.value).replace(/[^\d]/g, ""));
      if (Number.isFinite(parsed) && parsed > 0) seats = parsed;
    }
  }
  return {
    doors: formatVehicleCount(doors),
    passengers: formatVehicleCount(seats),
  };
}
