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

const reportId = process.argv[2]?.trim();
const opsKey = process.env.AUTOVERIFI_OPS_SECRET?.trim();
if (!reportId) {
  console.error("Usage: node scripts/ops-ravin-trace.mjs AV-…");
  process.exit(1);
}
if (!opsKey) {
  console.error("AUTOVERIFI_OPS_SECRET missing in .env.local");
  process.exit(1);
}

const base = process.argv[3]?.trim() || "https://www.autoverifi.com.au";
const url = `${base.replace(/\/$/, "")}/api/health/ravin?reportId=${encodeURIComponent(reportId)}`;
const res = await fetch(url, { headers: { "x-autoverifi-ops-key": opsKey } });
const text = await res.text();
console.log(text);
