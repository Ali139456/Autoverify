/**
 * One-off dev helper: extract a <style> block from a static LAV HTML export
 * into `src/components/lender-asset-verification/lender-asset-verification.css`.
 *
 * Usage:
 *   node scripts/extract-lav-css.mjs path/to/lav-export.html
 */
import fs from "fs";
import path from "path";

const htmlPath = process.argv[2];
if (!htmlPath?.trim()) {
  console.error(
    "Pass the path to a LAV HTML export, e.g. node scripts/extract-lav-css.mjs ./lav-export.html",
  );
  process.exit(1);
}

const resolvedHtml = path.resolve(process.cwd(), htmlPath);
const outPath = path.join(
  process.cwd(),
  "src/components/lender-asset-verification/lender-asset-verification.css",
);

const html = fs.readFileSync(resolvedHtml, "utf8");
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
  if (t.startsWith("/*")) return t;
  return `.lav ${line.trimStart()}`;
});

css = lines.filter(Boolean).join("\n");
css = css.replace(/\.lav \/\*([^*]+)\*\//g, "/*$1*/");

fs.writeFileSync(outPath, css.trim() + "\n", "utf8");
console.log(`Wrote ${outPath}`);
