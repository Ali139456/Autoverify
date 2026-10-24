import fs from "fs";
import path from "path";

const htmlPath = path.join(process.cwd(), "index (1).html");
const outPath = path.join(
  process.cwd(),
  "src/components/lender-asset-verification/lender-asset-verification.css",
);

const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<style>([\s\S]*?)<\/style>/);
if (!match) throw new Error("No <style> block found");

let css = match[1];
css = css.replace(/^:root\s*\{/m, ".lav {");
css = css.replace(/^\*\s*\{/m, ".lav * {");
css = css.replace(/^html\s*\{/m, ".lav {");
css = css.replace(/^body\s*\{/m, ".lav {");

const lines = css.split("\n").map((line) => {
  const t = line.trimStart();
  if (!t) return "";
  if (t.startsWith("@")) return line;
  if (t.startsWith(".lav")) return line;
  if (/^\.[a-z#[]/.test(t)) return `.lav ${line.trimStart()}`;
  if (t.startsWith("}")) return `.lav ${t}`;
  return `.lav ${line.trimStart()}`;
});

css = lines.filter(Boolean).join("\n");
css = css.replace(/\.lav \.lav /g, ".lav ");
css = css.replace(/\.lav \.lav\{/g, ".lav {");

fs.writeFileSync(outPath, css);
console.log("Wrote", outPath);
