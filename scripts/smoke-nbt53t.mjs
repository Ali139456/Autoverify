import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
);

const apiKey = env.AUTOGRAB_API_KEY;
const base = (env.AUTOGRAB_BASE_URL ?? "https://api.autograb.com.au/v2").replace(
  /\/$/,
  "",
);

if (!apiKey) {
  console.error("AUTOGRAB_API_KEY missing in .env.local");
  process.exit(1);
}

const headers = { ApiKey: apiKey, "Content-Type": "application/json" };
const plate = "NBT53T";
const state = "NSW";
const features = "build_data,performance_info,writeoff_info";
const overlayFeatures = "avg_price,avg_kms,days_supply,vehicle_rrp";

async function get(path) {
  const res = await fetch(`${base}${path}`, { headers, cache: "no-store" });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 500) };
  }
  return { status: res.status, ok: res.ok, json };
}

async function post(path, body) {
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, json };
}

const reg = await get(
  `/vehicles/registrations/${encodeURIComponent(plate)}?region=au&state=${state}&features=${features}`,
);
const vehicleId = reg.json?.vehicle?.id;
console.log("1) Registration", plate, state, "→ status", reg.status);
console.log("   vehicle_id:", vehicleId ?? "(none)");
if (reg.json?.vehicle) {
  const v = reg.json.vehicle;
  console.log(
    "   catalogue:",
    [v.year, v.make, v.model, v.badge].filter(Boolean).join(" "),
  );
}

const kms = 49935;
const predictMinimal = await post("/valuations/predict", {
  region: "au",
  vehicle_id: vehicleId ?? "5881013674704896",
});
const predictFull = await post("/valuations/predict", {
  region: "au",
  catalogue: "autograb",
  vehicle_id: vehicleId ?? "5881013674704896",
  kms,
  condition_score: 3,
});

const overlayPath = `/sourcing/market_overlay/${vehicleId ?? "5881013674704896"}?region=au&exclude_outliers=true&include_all_active=true&include_trash=false&features=${overlayFeatures}`;
const overlay = await get(overlayPath);

const pMin = predictMinimal.json?.prediction ?? predictMinimal.json;
const pFull = predictFull.json?.prediction ?? predictFull.json;

console.log("\n2) POST /valuations/predict (Thomas-style: region + vehicle_id only)");
console.log("   status:", predictMinimal.status, "price:", pMin?.price ?? pMin?.retail_price, "kms:", pMin?.kms, "score:", pMin?.score);

console.log("\n3) POST /valuations/predict (Auto Verifi: + kms, catalogue, condition_score)");
console.log("   status:", predictFull.status, "retail:", pFull?.retail_price ?? pFull?.price, "trade:", pFull?.trade_price, "kms:", pFull?.kms);

console.log("\n4) GET market_overlay (with exclude_outliers / include_all_active)");
console.log("   status:", overlay.status, "avg_price:", overlay.json?.avg_price, "sample_size:", overlay.json?.sample_size);
console.log("   leads count:", Array.isArray(overlay.json?.leads) ? overlay.json.leads.length : 0);

console.log("\n--- Thomas reference (email) ---");
console.log("   vehicle_id: 5881013674704896, predict price ~58342, avg_price ~59726");

const thomasPredict = 58342;
const thomasAvg = 59726;
const ourPrice = Number(pFull?.retail_price ?? pFull?.price) || 0;
const ourAvg = Number(overlay.json?.avg_price) || 0;
if (ourPrice) {
  const pct = Math.abs(ourPrice - thomasPredict) / thomasPredict;
  console.log(
    `\nMatch predict retail: ${pct <= 0.02 ? "OK" : "CHECK"} (${ourPrice} vs ${thomasPredict}, ${(pct * 100).toFixed(1)}% diff)`,
  );
}
if (ourAvg) {
  const pct = Math.abs(ourAvg - thomasAvg) / thomasAvg;
  console.log(
    `Match overlay avg_price: ${pct <= 0.02 ? "OK" : "CHECK"} (${ourAvg} vs ${thomasAvg}, ${(pct * 100).toFixed(1)}% diff)`,
  );
}
