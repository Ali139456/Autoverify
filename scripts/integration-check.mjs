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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  });

const base = process.argv[2] ?? "https://www.autoverifi.com.au";

async function check(name, fn) {
  try {
    const result = await fn();
    console.log(`OK   ${name}`, result ?? "");
    return true;
  } catch (err) {
    console.log(`FAIL ${name}`, err instanceof Error ? err.message : err);
    return false;
  }
}

let ok = 0;
let fail = 0;

async function run() {
  console.log("=== Production URLs ===", base);

  if (
    await check("webhook GET", async () => {
      const res = await fetch(`${base}/api/webhooks/ravin`);
      const text = await res.text();
      if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 80)}`);
      return text.slice(0, 120);
    })
  ) {
    ok++;
  } else fail++;

  if (
    await check("health/ravin (may be blocked by Coming Soon)", async () => {
      const res = await fetch(`${base}/api/health/ravin?probe=1`, {
        redirect: "manual",
      });
      const text = await res.text();
      if (text.includes("Launching soon")) {
        throw new Error("Coming Soon page — add /api/health to public routes or set SITE_LAUNCHED");
      }
      if (!res.ok && res.status !== 200) throw new Error(`${res.status}`);
      return text.slice(0, 200);
    })
  ) {
    ok++;
  } else fail++;

  if (
    await check("health/sms", async () => {
      const res = await fetch(`${base}/api/health/sms`, { redirect: "manual" });
      const text = await res.text();
      if (text.includes("Launching soon")) throw new Error("Coming Soon blocked");
      return text;
    })
  ) {
    ok++;
  } else fail++;

  if (
    await check("sample-report/insights-plus", async () => {
      const res = await fetch(`${base}/sample-report/insights-plus`);
      if (!res.ok) throw new Error(String(res.status));
      return `HTTP ${res.status}`;
    })
  ) {
    ok++;
  } else fail++;

  console.log("\n=== Local .env.local ===");

  const agKey = process.env.AUTOGRAB_API_KEY?.trim();
  if (
    await check("Autograb API key present", async () => {
      if (!agKey) throw new Error("AUTOGRAB_API_KEY missing");
      return `${agKey.slice(0, 6)}…`;
    })
  ) {
    ok++;
  } else fail++;

  if (
    await check("Ravin getSignInToken", async () => {
      const key = process.env.RAVIN_API_KEY?.trim();
      const site = Number(process.env.RAVIN_SITE_ID);
      if (!key || !Number.isFinite(site)) throw new Error("RAVIN_API_KEY or RAVIN_SITE_ID missing");
      const url = (process.env.RAVIN_BASE_URL ?? "https://inspect.mtaus.ravin-ai.com").replace(
        /\/$/,
        "",
      );
      const res = await fetch(`${url}/getSignInToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientKey: key }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error ?? `HTTP ${res.status}`);
      if (!body?.token) throw new Error("no token in response");
      const hasS3 =
        body.AWSAccessKeyId ||
        body.accessKeyId ||
        body.s3Policy ||
        body.policy;
      return hasS3 ? "token + S3 POST fields" : "token received (no S3 fields in JSON)";
    })
  ) {
    ok++;
  } else fail++;

  if (
    await check("Ravin partnerInvite", async () => {
      const key = process.env.RAVIN_API_KEY?.trim();
      const site = Number(process.env.RAVIN_SITE_ID);
      if (!key || !Number.isFinite(site)) throw new Error("RAVIN_API_KEY or RAVIN_SITE_ID missing");
      const url = (process.env.RAVIN_BASE_URL ?? "https://inspect.mtaus.ravin-ai.com").replace(
        /\/$/,
        "",
      );
      const signIn = await fetch(`${url}/getSignInToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientKey: key }),
      });
      const signBody = await signIn.json().catch(() => ({}));
      if (!signIn.ok || !signBody?.token) {
        throw new Error(signBody?.message ?? signBody?.error ?? `sign-in HTTP ${signIn.status}`);
      }
      const res = await fetch(`${url}/partnerInvite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnerToken: signBody.token,
          siteId: site,
          provider: process.env.RAVIN_PROVIDER ?? "consumer",
          linkExpireIn: Number(process.env.RAVIN_LINK_EXPIRE_IN ?? 72),
          loginExpireIn: Number(process.env.RAVIN_LOGIN_EXPIRE_IN ?? 48),
          claimId: "integration-test",
          lp: "TEST01",
          state: "NSW",
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.message ?? body?.error ?? `HTTP ${res.status}`);
      const link = body?.message ?? body?.inviteUrl ?? body?.url;
      if (!link || typeof link !== "string") throw new Error("no invite link in response");
      return link.slice(0, 72) + (link.length > 72 ? "…" : "");
    })
  ) {
    ok++;
  } else fail++;

  const s3 =
    process.env.RAVIN_S3_ACCESS_KEY_ID &&
    process.env.RAVIN_S3_POLICY &&
    process.env.RAVIN_S3_SIGNATURE;
  console.log(s3 ? "OK   Ravin S3 ingest env" : "MISS Ravin S3 ingest (ask Ravin/Denise)");
  if (!s3) fail++;
  else ok++;

  const webhookSecret = process.env.RAVIN_WEBHOOK_SECRET?.trim();
  console.log(
    webhookSecret
      ? "OK   RAVIN_WEBHOOK_SECRET set locally"
      : "MISS RAVIN_WEBHOOK_SECRET (generate + Vercel + Ravin)",
  );
  if (!webhookSecret) fail++;
  else ok++;

  console.log(`\nDone: ${ok} passed, ${fail} failed/missing`);
  process.exit(fail > 0 ? 1 : 0);
}

run();
