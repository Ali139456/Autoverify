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
    "Odometer",
    vehicle.odometer ? `${vehicle.odometer.toLocaleString("en-AU")} km` : null,
  );
  pushRow(dataRows, "VIN", vehicle.vin);
  pushRow(dataRows, "Make", vehicle.make);
  pushRow(dataRows, "Model", vehicle.model);
  pushRow(dataRows, "Variant / badge", vehicle.variant);
  pushRow(dataRows, "Series", vehicle.series);
  pushRow(dataRows, "Body type", vehicle.bodyType);
  pushRow(dataRows, "Fuel type", vehicle.fuelType);
  pushRow(dataRows, "Transmission", vehicle.transmission);
  pushRow(dataRows, "Engine", vehicle.engine);
  pushRow(dataRows, "Year of manufacture", vehicle.year ? String(vehicle.year) : null);
  pushRow(dataRows, "Colour", vehicle.colour);
  pushRow(
    dataRows,
    "Registration status",
    registration.status === "Registered" ? "Registered" : registration.status,
  );
  pushRow(dataRows, "Registration expiry", registration.expiryDate);

  pushRow(dataRows, "Model year", vehicleRecord.model_year);
  pushRow(dataRows, "Release year", vehicleRecord.release_year);
  pushRow(dataRows, "Release month", vehicleRecord.release_month);
  pushRow(dataRows, "Drive type", vehicleRecord.drive_type ?? vehicleRecord.drive);
  pushRow(dataRows, "Doors", vehicleRecord.num_doors);
  pushRow(dataRows, "Seats", vehicleRecord.num_seats);
  pushRow(dataRows, "Gears", vehicleRecord.num_gears);
  pushRow(dataRows, "Cylinders", vehicleRecord.num_cylinders);
  pushRow(dataRows, "Engine type", vehicleRecord.engine_type);
  pushRow(dataRows, "Battery (kWh)", vehicleRecord.battery_kwh);
  pushRow(dataRows, "Range (km)", vehicleRecord.range);

  if (performance) {
    pushRow(dataRows, "Power (kW)", performance.power_kw);
    pushRow(dataRows, "Torque (Nm)", performance.torque_nm);
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
