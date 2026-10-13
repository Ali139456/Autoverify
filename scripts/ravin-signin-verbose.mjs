import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
readFileSync(join(root, ".env.local"), "utf8")
  .split(/\r?\n/)
  .forEach((line) => {
    if (!line || line.startsWith("#") || !line.includes("=")) return;
    const i = line.indexOf("=");
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    process.env[line.slice(0, i).trim()] = v;
  });

const key = process.env.RAVIN_API_KEY?.trim();
const url = "https://inspect.mtaus.ravin-ai.com/getSignInToken";

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify({ clientKey: key }),
});

console.log("status", res.status);
console.log("headers", Object.fromEntries(res.headers.entries()));
const text = await res.text();
console.log("body", text);
