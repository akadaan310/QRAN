#!/usr/bin/env node
/**
 * Copies the repo-root data/ layer into prototype/public/data/ so the app
 * can fetch it at runtime as static assets. It must NOT be bundled via ES
 * `import` — roots.json alone is 5MB, and the whole layer is 16MB; inlining
 * it into the JS bundle would defeat both the 60fps budget and the
 * per-surah lazy-loading data/README.md's rendering rule calls for.
 *
 * data/ at the repo root stays the single source of truth (never edit the
 * copy in prototype/public/data/ by hand). Run automatically as part of
 * `npm run build` and `npm run dev` (see package.json).
 */
import { cpSync, existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "../../data");
const DEST = path.resolve(__dirname, "../public/data");

if (!existsSync(SRC)) {
  console.error(`sync-data: source not found at ${SRC}`);
  process.exit(1);
}

if (existsSync(DEST)) rmSync(DEST, { recursive: true, force: true });
cpSync(SRC, DEST, { recursive: true });

function dirSize(p) {
  let total = 0;
  for (const entry of readdirSync(p, { withFileTypes: true })) {
    const full = path.join(p, entry.name);
    total += entry.isDirectory() ? dirSize(full) : statSync(full).size;
  }
  return total;
}

const bytes = dirSize(DEST);
console.log(`sync-data: ${SRC} -> public/data (${(bytes / 1024 / 1024).toFixed(1)} MB)`);
