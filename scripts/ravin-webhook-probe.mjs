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
    process.env[k] = v;
  });

const base = process.argv[2] ?? "https://autoverifi.com.au";
const reportId = process.argv[3] ?? "AV-MV7TCHG5-OY5ZSWRO";
const secret = process.env.RAVIN_WEBHOOK_SECRET?.trim();
if (!secret) {
  console.error("RAVIN_WEBHOOK_SECRET missing");
  process.exit(1);
}

const payload = {
  claimId: reportId,
  reportId,
  invitationId: reportId,
};

const res = await fetch(`${base.replace(/\/$/, "")}/api/webhooks/ravin`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-ravin-webhook-secret": secret,
  },
  body: JSON.stringify(payload),
});

console.log("HTTP", res.status);
console.log(await res.text());
