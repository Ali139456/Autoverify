import fs from "fs";

const html = fs.readFileSync(
  "1793948804643_AutoVerifi-booking-journey (9).html",
  "utf8",
);
const match = html.match(
  /class="hero-img"[\s\S]*?src="data:image\/jpeg;base64,([^"]+)/,
);
if (!match) {
  console.error("Hero image not found in brief HTML");
  process.exit(1);
}
const buf = Buffer.from(match[1], "base64");
const out = "public/vehicle-inspections/pre-purchase-hero.jpg";
fs.mkdirSync("public/vehicle-inspections", { recursive: true });
fs.writeFileSync(out, buf);
console.log("Wrote", out, buf.length, "bytes");
