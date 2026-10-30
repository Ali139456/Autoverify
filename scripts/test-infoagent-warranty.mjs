/**
 * Smoke test: InfoAgent AU Warranty & Service report (TEST or prod).
 *
 *   node --env-file=.env.local scripts/test-infoagent-warranty.mjs
 *
 * Env (OAuth — recommended):
 *   INFOAGENT_API_BASE_URL=https://api.dev.infoagent.com.au
 *   INFOAGENT_CLIENT_ID=
 *   INFOAGENT_CLIENT_SECRET=
 *
 * Or pre-issued bearer:
 *   INFOAGENT_API_KEY=
 *
 * TEST identifiers (PDF sample data):
 *   INFOAGENT_TEST_REGO=SJJ21M
 *   INFOAGENT_TEST_STATE=NSW
 *   # or INFOAGENT_TEST_VIN=WS5OF2XP5XT455180
 */

const base = process.env.INFOAGENT_API_BASE_URL?.replace(/\/$/, "");
const clientId = process.env.INFOAGENT_CLIENT_ID?.trim();
const clientSecret = process.env.INFOAGENT_CLIENT_SECRET?.trim();
const apiKey = process.env.INFOAGENT_API_KEY?.trim();
const warrantyPath =
  process.env.INFOAGENT_WARRANTY_PATH?.trim() ||
  process.env.INFOAGENT_VEHICLE_PATH?.trim() ||
  "/ivds/v1/au/vehicle-report/warranty-service";

const vin = process.env.INFOAGENT_TEST_VIN?.trim().toUpperCase();
const rego = process.env.INFOAGENT_TEST_REGO?.trim().toUpperCase();
const state = process.env.INFOAGENT_TEST_STATE?.trim().toUpperCase();

if (!base) {
  console.error("Set INFOAGENT_API_BASE_URL.");
  process.exit(1);
}
if (!(clientId && clientSecret) && !apiKey) {
  console.error("Set INFOAGENT_CLIENT_ID + INFOAGENT_CLIENT_SECRET or INFOAGENT_API_KEY.");
  process.exit(1);
}
if (!vin && !(rego && state)) {
  console.error("Set INFOAGENT_TEST_VIN or INFOAGENT_TEST_REGO + INFOAGENT_TEST_STATE.");
  process.exit(1);
}

async function getToken() {
  if (apiKey && !(clientId && clientSecret)) return apiKey;
  const res = await fetch(`${base}/auth/v1/token/oauth`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Token failed", res.status, data);
    process.exit(1);
  }
  return data.access_token;
}

const token = await getToken();
const body =
  vin && vin.length === 17
    ? { vin }
    : { plate: rego, state };

const url = `${base}${warrantyPath.startsWith("/") ? warrantyPath : `/${warrantyPath}`}`;
console.log(`POST ${url}`);
console.log("Body:", JSON.stringify(body));

const res = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify(body),
});

const text = await res.text();
console.log(`HTTP ${res.status}`);

let json;
try {
  json = JSON.parse(text);
  console.log(JSON.stringify(json, null, 2));
} catch {
  console.log(text.slice(0, 4000));
  process.exit(1);
}

const info = json?.result?.vehicle?.warrantyServiceInfo;
const details = json?.result?.vehicle?.details;
if (info) {
  console.log("\n--- warrantyServiceInfo ---");
  console.log(JSON.stringify(info, null, 2));
}
if (details?.compliancePlate) {
  console.log("\ncompliancePlate (warranty timing basis):", details.compliancePlate);
}
if (info && !info.warrantyStartDate && !info.warrantyEndDate) {
  console.log(
    "\nNote: OpenAPI has no warrantyStartDate/warrantyEndDate — use compliancePlate + warrantyYears if needed.",
  );
}

process.exit(res.ok ? 0 : 1);
