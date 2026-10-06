import { formatExpiryDate } from "./report-design";
import type {
  RegistrationInfo,
  VehicleFactoryFeature,
  VehicleIdentity,
  VehicleSpecSheet,
} from "./types";

type JsonRecord = Record<string, unknown>;

function pushRow(
  rows: { label: string; value: string }[],
  label: string,
  value: unknown,
) {
  if (value === null || value === undefined || value === "") return;
  rows.push({ label, value: String(value) });
}

function formatFeature(item: JsonRecord): VehicleFactoryFeature | null {
  const label = String(item.value ?? item.description ?? item.name ?? "").trim();
  if (!label) return null;
  const code = item.code ? String(item.code) : null;
  return { code, label };
}

function stringOrNull(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim();
  return text || null;
}

function rowExists(rows: { label: string }[], label: string): boolean {
  const key = label.toLowerCase();
  return rows.some((row) => row.label.toLowerCase() === key);
}

function findDetailedSpecValue(
  specs: JsonRecord[] | null,
  ...needles: string[]
): string | null {
  if (!specs) return null;
  for (const spec of specs) {
    const description = String(spec.description ?? spec.label ?? "").toLowerCase();
    if (!needles.some((needle) => description.includes(needle))) continue;
    const value = stringOrNull(spec.value);
    if (value) return value;
  }
  return null;
}

function resolveEngineSize(
  vehicle: VehicleIdentity,
  vehicleRecord: JsonRecord,
  detailedSpecs: JsonRecord[] | null,
): string | null {
  return (
    stringOrNull(vehicleRecord.engine_size) ??
    stringOrNull(vehicleRecord.engine_capacity) ??
    stringOrNull(vehicleRecord.engine_capacity_litres) ??
    findDetailedSpecValue(
      detailedSpecs,
      "engine size",
      "engine capacity",
      "displacement",
    ) ??
    (() => {
      const match = vehicle.engine.match(/(\d+(?:\.\d+)?)\s*L\b/i);
      return match ? `${match[1]}L` : null;
    })()
  );
}

function resolveCylindersRotors(
  vehicleRecord: JsonRecord,
  detailedSpecs: JsonRecord[] | null,
): string | null {
  const engineType = stringOrNull(vehicleRecord.engine_type);
  if (engineType) return engineType;

  const fromSpec = findDetailedSpecValue(
    detailedSpecs,
    "cylinders/rotors",
    "cylinders / rotors",
  );
  if (fromSpec) return fromSpec;

  const cylinderSpec = findDetailedSpecValue(detailedSpecs, "cylinder", "rotor");
  if (cylinderSpec) return cylinderSpec;

  const n = vehicleRecord.num_cylinders;
  if (n !== null && n !== undefined && n !== "") return String(n);
  return null;
}

function resolvePerformanceMetric(
  performance: JsonRecord | undefined,
  detailedSpecs: JsonRecord[] | null,
  keys: string[],
  specNeedles: string[],
): string | null {
  if (performance) {
    for (const key of keys) {
      const value = stringOrNull(performance[key]);
      if (value) return value;
    }
  }
  return findDetailedSpecValue(detailedSpecs, ...specNeedles);
}

export function buildVehicleSpecSheet(input: {
  vehicle: VehicleIdentity;
  registration: RegistrationInfo;
  vehicleRecord: JsonRecord;
  registrationData: JsonRecord;
  detailedSpecs: JsonRecord[] | null;
}): VehicleSpecSheet {
  const { vehicle, registration, vehicleRecord, registrationData, detailedSpecs } =
    input;
  const performance =
    (registrationData.performance_info as JsonRecord | undefined) ??
    (vehicleRecord.performance_info as JsonRecord | undefined);
  const buildData =
    (registrationData.build_data as JsonRecord | undefined) ??
    (vehicleRecord.build_data as JsonRecord | undefined);

  const dataRows: { label: string; value: string }[] = [];

  if (vehicle.rego) {
    pushRow(dataRows, "Registration plate", `${vehicle.rego} (${vehicle.state})`);
  }
  pushRow(
    dataRows,
    "Odometer history",
    vehicle.odometer
      ? `${vehicle.odometer.toLocaleString("en-AU")} km`
      : "No odometer history reported",
  );
  pushRow(dataRows, "VIN", vehicle.vin);
  pushRow(dataRows, "Make", vehicle.make);
  pushRow(dataRows, "Model", vehicle.model);
  pushRow(dataRows, "Variant / badge", vehicle.variant);
  pushRow(dataRows, "Series", vehicle.series);
  pushRow(dataRows, "Body type", vehicle.bodyType);
  const fuelType =
    findDetailedSpecValue(detailedSpecs, "fuel type", "fuel") ?? vehicle.fuelType;
  pushRow(dataRows, "Fuel type", fuelType);
  pushRow(dataRows, "Transmission", vehicle.transmission);
  pushRow(dataRows, "Engine", vehicle.engine);

  pushRow(
    dataRows,
    "Engine size",
    resolveEngineSize(vehicle, vehicleRecord, detailedSpecs),
  );
  pushRow(
    dataRows,
    "Cylinders/rotors",
    resolveCylindersRotors(vehicleRecord, detailedSpecs),
  );
  pushRow(
    dataRows,
    "Power (kW)",
    resolvePerformanceMetric(
      performance,
      detailedSpecs,
      ["power_kw", "power", "kw"],
      ["power (kw)", "power kw", "kilowatt"],
    ),
  );
  pushRow(
    dataRows,
    "Torque (Nm)",
    resolvePerformanceMetric(
      performance,
      detailedSpecs,
      ["torque_nm", "torque", "nm"],
      ["torque (nm)", "torque nm", "newton"],
    ),
  );

  pushRow(dataRows, "Year of manufacture", vehicle.year ? String(vehicle.year) : null);
  pushRow(dataRows, "Colour", vehicle.colour);
  pushRow(
    dataRows,
    "Registration status",
    registration.status === "Registered" ? "Registered" : registration.status,
  );
  pushRow(
    dataRows,
    "Registration expiry",
    registration.expiryDate
      ? formatExpiryDate(registration.expiryDate)
      : null,
  );

  pushRow(dataRows, "Model year", vehicleRecord.model_year);
  pushRow(dataRows, "Release year", vehicleRecord.release_year);
  pushRow(dataRows, "Release month", vehicleRecord.release_month);
  pushRow(dataRows, "Drive type", vehicleRecord.drive_type ?? vehicleRecord.drive);
  pushRow(dataRows, "Doors", vehicleRecord.num_doors);
  pushRow(dataRows, "Seats", vehicleRecord.num_seats);
  pushRow(dataRows, "Gears", vehicleRecord.num_gears);
  if (!rowExists(dataRows, "Cylinders/rotors")) {
    pushRow(dataRows, "Cylinders", vehicleRecord.num_cylinders);
    pushRow(dataRows, "Engine type", vehicleRecord.engine_type);
  }
  pushRow(dataRows, "Battery (kWh)", vehicleRecord.battery_kwh);
  pushRow(dataRows, "Range (km)", vehicleRecord.range);

  if (performance) {
    if (!rowExists(dataRows, "Power (kW)")) {
      pushRow(dataRows, "Power (kW)", performance.power_kw ?? performance.power);
    }
    if (!rowExists(dataRows, "Torque (Nm)")) {
      pushRow(dataRows, "Torque (Nm)", performance.torque_nm ?? performance.torque);
    }
    pushRow(dataRows, "Weight (tonnes)", performance.weight_tonnes);
    pushRow(dataRows, "Power to weight", performance.power_to_weight_ratio);
  }

  if (buildData) {
    pushRow(dataRows, "Build date", buildData.build_date);
    pushRow(dataRows, "Build provider", buildData.provider);
    pushRow(dataRows, "Compliance date", buildData.compliance_date);
    pushRow(dataRows, "Engine number", buildData.engine_number);
    pushRow(dataRows, "Country of origin", buildData.country_of_origin);
  }

  if (detailedSpecs) {
    for (const spec of detailedSpecs) {
      const description = String(spec.description ?? spec.label ?? "").trim();
      const value = String(spec.value ?? "").trim();
      if (!description || !value) continue;
      const exists = dataRows.some(
        (row) => row.label.toLowerCase() === description.toLowerCase(),
      );
      if (!exists) {
        pushRow(dataRows, description, value);
      }
    }
  }

  const factoryFeatures: VehicleFactoryFeature[] = [];
  const rawFeatures = buildData?.features;
  if (Array.isArray(rawFeatures)) {
    for (const item of rawFeatures) {
      if (!item || typeof item !== "object") continue;
      const feature = formatFeature(item as JsonRecord);
      if (feature) factoryFeatures.push(feature);
    }
  }

  return {
    capturedAt: new Date().toISOString(),
    dataRows,
    factoryFeatures,
  };
}

export function hasVehicleSpecContent(sheet: VehicleSpecSheet | null | undefined): boolean {
  if (!sheet) return false;
  return sheet.dataRows.length > 0 || sheet.factoryFeatures.length > 0;
}
