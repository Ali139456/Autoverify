const base = (process.argv[2] ?? "http://localhost:3001").replace(/\/$/, "");

async function run() {
  let failed = 0;

  const ppsr = await fetch(`${base}/api/sample-report/ppsr`);
  const ppsrBuf = Buffer.from(await ppsr.arrayBuffer());
  const ppsrOk = ppsr.status === 200 && ppsrBuf.slice(0, 4).toString() === "%PDF";
  console.log(ppsrOk ? "OK  sample PPSR PDF" : `FAIL sample PPSR ${ppsr.status} header=${ppsrBuf.slice(0, 8).toString()}`);
  if (!ppsrOk) failed++;

  const checkout = await fetch(`${base}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  const checkoutOk = checkout.status === 400 || checkout.status === 401 || checkout.status === 422;
  console.log(
    checkoutOk
      ? `OK  /api/checkout rejects empty body (${checkout.status})`
      : `FAIL /api/checkout unexpected ${checkout.status}`,
  );
  if (!checkoutOk) failed++;

  const sms = await fetch(`${base}/api/health/sms`);
  const smsOk = sms.status >= 200 && sms.status < 500;
  console.log(smsOk ? `OK  /api/health/sms (${sms.status})` : `FAIL /api/health/sms ${sms.status}`);
  if (!smsOk) failed++;

  const preview = await fetch(`${base}/preview`);
  const previewOk = preview.status === 200 || preview.status === 307 || preview.status === 401;
  console.log(previewOk ? `OK  /preview (${preview.status})` : `FAIL /preview ${preview.status}`);
  if (!previewOk) failed++;

  console.log(failed ? `\n${failed} API check(s) failed.` : "\nAll API smoke checks passed.");
  process.exit(failed ? 1 : 0);
}

run();
