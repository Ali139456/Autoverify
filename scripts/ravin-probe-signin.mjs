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
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  });

const key = process.env.RAVIN_API_KEY?.trim();
const url = (process.env.RAVIN_BASE_URL ?? "https://inspect.mtaus.ravin-ai.com").replace(
  /\/$/,
  "",
);

if (!key) {
  console.error("No RAVIN_API_KEY");
  process.exit(1);
}

console.log("Key length:", key.length, "prefix:", key.slice(0, 8) + "…");

const bodies = [
  { clientKey: key },
  { clientKey: key, siteId: 49 },
  { clientKey: key, clientId: "autoverifi", siteId: 49 },
];

for (const body of bodies) {
  const res = await fetch(`${url}/getSignInToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await res.json().catch(() => ({}));
  const summary =
    j.token ? "token ok" : j.message ?? j.error ?? JSON.stringify(j).slice(0, 120);
  console.log(res.status, Object.keys(body).join("+"), "→", summary);
}
