import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve("src");
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.jsx?$/.test(e.name)) files.push(p);
  }
})(SRC);

// Globals that are always available and must not be reported.
const GLOBALS = new Set([
  "React", "Fragment", "window", "document", "console", "localStorage",
  "sessionStorage", "navigator", "location", "history", "fetch", "alert",
  "confirm", "prompt", "setTimeout", "clearTimeout", "setInterval",
  "clearInterval", "requestAnimationFrame", "cancelAnimationFrame",
  "Promise", "Array", "Object", "String", "Number", "Boolean", "Date",
  "Math", "JSON", "Map", "Set", "WeakMap", "WeakSet", "Error", "RegExp",
  "Symbol", "BigInt", "Intl", "URL", "URLSearchParams", "FormData", "Blob",
  "File", "FileReader", "Image", "Audio", "AbortController", "Event",
  "CustomEvent", "IntersectionObserver", "ResizeObserver", "MutationObserver",
  "structuredClone", "queueMicrotask", "crypto", "performance", "isNaN",
  "isFinite", "parseInt", "parseFloat", "encodeURIComponent",
  "decodeURIComponent", "encodeURI", "decodeURI", "globalThis", "Infinity",
  "NaN", "undefined", "Proxy", "Reflect", "TextEncoder", "TextDecoder",
]);

// Strip comments and string/template literals so matches come from real code.
function stripNoise(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ")
    .replace(/`(?:\\[\s\S]|\$\{[^}]*\}|[^`\\])*`/g, "``")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''");
}

const report = [];

for (const f of files) {
  const raw = fs.readFileSync(f, "utf8");
  const src = stripNoise(raw);
  const rel = path.relative(".", f).split(path.sep).join("/");
  const isJsx = f.endsWith(".jsx");

  // ---- names in scope -------------------------------------------------
  const scope = new Set(GLOBALS);

  const impRe = /(?:^|\n)\s*import\s+([^;]*?)\s+from\s*["'][^"']*["']/g;
  let m;
  while ((m = impRe.exec(src))) {
    const clause = m[1];
    const braced = clause.match(/\{([^}]*)\}/);
    if (braced) {
      for (const part of braced[1].split(",")) {
        const t = part.trim();
        if (t) scope.add((t.split(/\s+as\s+/).pop() || t).trim());
      }
    }
    const def = clause.replace(/\{[^}]*\}/, "").replace(/,/g, " ").trim();
    if (def) {
      const d0 = def.replace(/^\*\s+as\s+/, "").split(/\s+/)[0];
      if (d0) scope.add(d0);
    }
  }

  // declarations: function/class, const/let/var (incl. destructuring), params
  const declRe =
    /(?:^|[\s;{}(])(?:function\s*\*?\s*|class\s+)([A-Za-z0-9_$]+)|(?:^|[\s;{}(])(?:const|let|var)\s+([A-Za-z0-9_$]+)/g;
  let d;
  while ((d = declRe.exec(src))) scope.add(d[1] || d[2]);

  // any identifier bound by a destructuring pattern or param list
  for (const block of src.match(/\{[^{}]*\}\s*=/g) || []) {
    for (const id of block.match(/[A-Za-z_$][A-Za-z0-9_$]*/g) || []) scope.add(id);
  }
  for (const block of src.match(/\([^()]*\)\s*=>/g) || []) {
    for (const id of block.match(/[A-Za-z_$][A-Za-z0-9_$]*/g) || []) scope.add(id);
  }
  for (const block of src.match(/function[^(]*\(([^()]*)\)/g) || []) {
    for (const id of block.match(/[A-Za-z_$][A-Za-z0-9_$]*/g) || []) scope.add(id);
  }
  // catch(err), for (const x of ...) already covered by const/let/var
  for (const block of src.match(/catch\s*\(([^)]*)\)/g) || []) {
    for (const id of block.match(/[A-Za-z_$][A-Za-z0-9_$]*/g) || []) scope.add(id);
  }

  const lineOf = (idx) => src.slice(0, idx).split("\n").length;
  const seen = new Set();
  const flag = (name, idx, kind) => {
    if (scope.has(name) || seen.has(name)) return;
    seen.add(name);
    report.push(`${rel}:${lineOf(idx)}  ${kind} '${name}' NOT IMPORTED / NOT DEFINED`);
  };

  // ---- 1. hook calls: useXxx(...) not preceded by a dot ----------------
  const hookRe = /(^|[^.\w$])(use[A-Z][A-Za-z0-9_$]*)\s*\(/g;
  let h;
  while ((h = hookRe.exec(src))) flag(h[2], h.index, "hook");

  // ---- 2. JSX element names -------------------------------------------
  if (isJsx) {
    const jsxRe = /<([A-Z][A-Za-z0-9_$]*)(?:\.[A-Za-z0-9_$]+)*[\s/>]/g;
    let j;
    while ((j = jsxRe.exec(src))) flag(j[1], j.index, "component");
  }
}

console.log(report.length ? report.join("\n") : "NO UNDEFINED HOOKS / COMPONENTS");
console.log("\ntotal: " + report.length + "   files scanned: " + files.length);
