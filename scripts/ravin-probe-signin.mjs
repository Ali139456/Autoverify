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

const bases = [
  url,
  "https://beta.mtaus.ravin-ai.com",
];

const bodies = [
  { clientKey: key },
  { clientKey: key, siteId: 49 },
  { clientKey: key, clientId: "autoverifi", siteId: 49 },
  { ClientKey: key },
  { client_key: key },
];

for (const base of bases) {
  console.log("\n===", base, "===");
  for (const body of bodies) {
    const res = await fetch(`${base.replace(/\/$/, "")}/getSignInToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let summary = text.slice(0, 160);
    try {
      const j = JSON.parse(text);
      summary = j.token ? "token ok" : j.message ?? j.error ?? summary;
    } catch {
      /* keep text */
    }
    console.log(res.status, Object.keys(body).join("+"), "→", summary);
  }
}
