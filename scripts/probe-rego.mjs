import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
readFileSync(join(root, ".env.local"), "utf8")
  .split(/\r?\n/)
  .forEach((line) => {
    if (!line || line.startsWith("#") || !line.includes("=")) return;
    const i = line.indexOf("=");
    const k = line.slice(0, i).trim();
    if (!process.env[k]) process.env[k] = line.slice(i + 1).trim();
  });

const plate = (process.argv[2] ?? "MB3NZ").toUpperCase();
const state = (process.argv[3] ?? "NSW").toUpperCase();

const { lookupVehicle } = await import("../src/lib/autograb.ts");

try {
  const result = await lookupVehicle(plate, state, { preview: true });
  console.log(
    "OK",
    plate,
    state,
    "→",
    result.vehicle.year,
    result.vehicle.make,
    result.vehicle.model,
    result.vehicle.variant,
  );
  process.exit(0);
} catch (err) {
  console.log("FAIL", plate, state, err?.name, err?.message);
  process.exit(1);
}
