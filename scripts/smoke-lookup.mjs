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

const { lookupVehicle } = await import("../src/lib/autograb.ts");

const result = await lookupVehicle("NBT53T", "NSW", {
  customerOdometer: 50000,
  listingPrice: 50000,
});

const retailMid =
  (result.valuation.retailLow + result.valuation.retailHigh) / 2;
const today =
  result.futureValue.predictions.find((p) => p.yearsAhead === 0)?.value ?? 0;
const comps = result.market?.comparableListings?.length ?? 0;

console.log("vehicle:", result.vehicle.year, result.vehicle.make, result.vehicle.model, result.vehicle.variant);
console.log("valuation retail mid (raw):", Math.round(retailMid));
console.log("future today (stored):", today);
console.log("comparables:", comps, "market avg:", result.market?.averagePrice);

const { resolveValuation, resolveFutureValue } = await import(
  "../src/lib/report-design.ts"
);
const report = {
  id: "SMOKE",
  createdAt: new Date().toISOString(),
  status: "paid",
  tier: "insights",
  advertisedPrice: 50000,
  vehicle: result.vehicle,
  registration: result.registration,
  valuation: result.valuation,
  futureValue: result.futureValue,
  market: result.market,
  ai: result.ai,
  vehicleSpec: result.vehicleSpec,
};
const resolvedVal = resolveValuation(report);
const resolvedMid = (resolvedVal.retailLow + resolvedVal.retailHigh) / 2;
const resolvedFuture = resolveFutureValue(report);
const resolvedToday =
  resolvedFuture.predictions.find((p) => p.yearsAhead === 0)?.value ?? 0;

console.log("display retail mid (resolved):", Math.round(resolvedMid));
console.log("display future today (resolved):", resolvedToday);

const ok =
  retailMid > 40000 &&
  resolvedToday >= 45000 &&
  resolvedMid >= 45000 &&
  comps >= 3;
console.log(ok ? "\nOK  full lookup + display resolution" : "\nFAIL lookup sanity");
process.exit(ok ? 0 : 1);
