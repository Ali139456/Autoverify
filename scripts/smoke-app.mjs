/**
 * Local / production smoke: pages, static sample assets, optional API checks.
 * Usage: node scripts/smoke-app.mjs [baseUrl]
 */
const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");

const pages = [
  "/",
  "/pricing",
  "/check",
  "/sample-report",
  "/sample-report/insights-plus",
  "/terms",
  "/privacy",
  "/vehicleinspections",
  "/robots.txt",
  "/sitemap.xml",
];

const assets = [
  "/sample/walkaround/front.jpg",
  "/sample/walkaround/keys.jpg",
  "/sample/walkaround/service-record.jpg",
  "/sample/damage/front-bumper.jpg",
  "/sample/damage/rear-left-door.jpg",
  "/sample/c300-hero.jpg",
  "/logo/auto-verifi-accent.svg",
];

const apis = [
  { path: "/api/sample-report/ppsr", expect: [200, 401, 403, 404, 500] },
];

async function check(name, url, okStatuses = [200]) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    const ok = okStatuses.includes(res.status);
    return { name, url, status: res.status, ok };
  } catch (err) {
    return {
      name,
      url,
      status: 0,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function checkPageContains(url, needles) {
  const res = await fetch(url);
  if (!res.ok) return { url, ok: false, status: res.status, missing: needles };
  const html = await res.text();
  const missing = needles.filter((n) => !html.includes(n));
  return { url, ok: missing.length === 0, status: res.status, missing };
}

console.log("Smoke base:", base);

const results = [];
for (const path of pages) {
  results.push(await check(path, `${base}${path}`, [200]));
}
for (const path of assets) {
  results.push(await check(`asset ${path}`, `${base}${path}`, [200]));
}
for (const api of apis) {
  results.push(await check(`api ${api.path}`, `${base}${api.path}`, api.expect));
}

const contentChecks = await Promise.all([
  checkPageContains(`${base}/sample-report/insights-plus`, [
    "Front bumper",
    "Rear left door",
    "# Keys",
  ]),
  checkPageContains(`${base}/sample-report`, ["Auto Verifi"]),
]);

let failed = 0;
for (const r of results) {
  const line = r.ok
    ? `OK  ${r.status} ${r.name}`
    : `FAIL ${r.status ?? "ERR"} ${r.name}${r.error ? ` (${r.error})` : ""}`;
  console.log(line);
  if (!r.ok) failed++;
}

for (const c of contentChecks) {
  const line = c.ok
    ? `OK  content ${c.url}`
    : `FAIL content ${c.url} missing: ${c.missing?.join(", ")}`;
  console.log(line);
  if (!c.ok) failed++;
}

console.log(failed ? `\n${failed} check(s) failed.` : "\nAll smoke checks passed.");
process.exit(failed ? 1 : 0);
