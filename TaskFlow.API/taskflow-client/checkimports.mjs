import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("src");
const exts = ["", ".js", ".jsx", ".json", "/index.js", "/index.jsx"];

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(jsx?|mjs)$/.test(e.name)) files.push(p);
  }
})(SRC);

const isFile = (p) => {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
};

const bad = [];
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const re =
    /(?:^|\n)\s*(?:import|export)[^;\n]*?from\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|(?:^|\n)\s*import\s+["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(src))) {
    const spec = m[1] || m[2] || m[3];
    if (!spec) continue;
    let base;
    if (spec.startsWith("@/")) base = path.join(SRC, spec.slice(2));
    else if (spec.startsWith(".")) base = path.resolve(path.dirname(f), spec);
    else continue;
    if (!exts.some((x) => isFile(base + x))) {
      const rel = path.relative(".", f).split(path.sep).join("/");
      bad.push(rel + "  ->  " + spec);
    }
  }
}

console.log(bad.length ? bad.join("\n") : "ALL IMPORTS RESOLVE");
console.log("\ntotal broken: " + bad.length + "   files scanned: " + files.length);
