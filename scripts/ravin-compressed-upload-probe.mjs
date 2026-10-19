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

const claimId = process.argv[2]?.trim() || "AV-MV9BM5AL-8DH8BW61";
const base = (process.env.RAVIN_BASE_URL ?? "https://inspect.mtaus.ravin-ai.com").replace(
  /\/$/,
  "",
);
const clientId = process.env.RAVIN_CLIENT_ID?.trim() || "autoverifi";
const siteId = Number(process.env.RAVIN_SITE_ID ?? "49");

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return Number(
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`,
  );
}

const ts = timestamp();
const payload = { clientId, siteId, claimId, timestamp: ts };

const res = await fetch(`${base}/generateCompressedDataUpload`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

const body = await res.json().catch(() => null);
const collect = (obj, out = {}, depth = 0) => {
  if (depth > 5 || !obj || typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string" && v.trim() && !out[k]) out[k] = v.trim().slice(0, 80);
    else if (v && typeof v === "object" && !Array.isArray(v)) collect(v, out, depth + 1);
  }
  return out;
};

const fields = body ? collect(body) : {};
const hasS3 = Boolean(
  fields["X-Amz-Algorithm"] || fields.Policy || fields.policy || fields.AWSAccessKeyId,
);

console.log(
  JSON.stringify(
    {
      request: payload,
      baseUrl: base,
      httpStatus: res.status,
      ok: res.ok,
      error: body?.error ?? body?.message ?? null,
      hasS3PostFields: hasS3,
      objectKey: fields.key || fields.Key || null,
      uploadUrlHint: fields.url || fields.uploadUrl || fields.bucket || null,
      parsedFieldNames: Object.keys(fields).sort(),
    },
    null,
    2,
  ),
);

process.exit(res.ok && hasS3 ? 0 : 1);
