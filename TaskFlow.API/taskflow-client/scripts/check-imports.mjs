import fs from "fs";
import path from "path";

const SRC = path.resolve("src");

const exts = [".js", ".jsx", ".ts", ".tsx"];

const imports = [];

function walk(dir) {
  for (const file of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, file.name);

    if (file.isDirectory()) {
      walk(full);
      continue;
    }

    if (!exts.includes(path.extname(file.name))) continue;

    const text = fs.readFileSync(full, "utf8");

    const matches = [
      ...text.matchAll(/from\s+["'](@\/[^"']+)["']/g),
      ...text.matchAll(/import\s*\(["'](@\/[^"']+)["']\)/g),
    ];

    for (const m of matches) {
      imports.push({
        file: full,
        importPath: m[1],
      });
    }
  }
}

walk(SRC);

let errors = 0;

for (const item of imports) {
  const rel = item.importPath.replace("@/", "");
  const base = path.join(SRC, rel);

  const candidates = [
    base,
    base + ".js",
    base + ".jsx",
    base + ".ts",
    base + ".tsx",
    path.join(base, "index.js"),
    path.join(base, "index.jsx"),
  ];

  const exists = candidates.some((f) => fs.existsSync(f));

  if (!exists) {
    errors++;

    console.log("\n❌ Missing Import");
    console.log("File :", path.relative(process.cwd(), item.file));
    console.log("Import:", item.importPath);
  }
}

console.log("\n=============================");

if (errors === 0) {
  console.log("✅ No broken imports found.");
} else {
  console.log(`❌ ${errors} broken imports found.`);
}
