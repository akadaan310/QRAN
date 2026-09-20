#!/usr/bin/env node
/**
 * Parses references/qalam-30-markers.md (the owner's verbatim QALAM text,
 * read-only) into structured JSON the scenario engine (§7.1) can search
 * against. Output: prototype/public/data/derived/qalam-markers.json —
 * generated, never hand-edited; source of truth stays the .md file.
 *
 * Each marker line has the shape:
 *   N. [QALAM] TITLE (ANCHOR) TRAILING TEXT...
 * TRAILING TEXT sometimes opens with an embedded, fully-voweled Quranic
 * phrase before the prose description — captured separately when present
 * (a citation the reader can search for verbatim), not required.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "../../references/qalam-30-markers.md");
const OUT_DIR = path.resolve(__dirname, "../public/data/derived");

const ARABIC_RUN = /[؀-ۿݐ-ݿ]+/g;
const MARKER_PREFIX = /^(\d{1,2})\.\s*\[QALAM\]\s*(.*)$/u;
const SECTION_LINE = /^([IVX]+)\.\s+(.+)$/u;

/**
 * Splits a marker's remainder ("TITLE (ANCHOR) trailing…") into its parts.
 * 29 of 30 markers carry a parenthetical anchor; #8 ("THE MUSA-YUSUF
 * DUALITY BRIDGE") names none, so the fallback splits the title off at the
 * first token that isn't ALL-CAPS — where the heading ends and the
 * descriptive sentence begins.
 */
function splitMarker(remainder) {
  const paren = /^(.*?)\(([^)]+)\)(.*)$/.exec(remainder);
  if (paren) return { title: paren[1].trim(), anchor: paren[2].trim(), trailing: paren[3] };
  const tokens = remainder.trim().split(/\s+/);
  let splitIdx = tokens.length;
  for (let i = 0; i < tokens.length; i++) {
    const bare = tokens[i].replace(/[^A-Za-z'-]/g, "");
    if (bare && bare !== bare.toUpperCase()) { splitIdx = i; break; }
  }
  return { title: tokens.slice(0, splitIdx).join(" "), anchor: null, trailing: " " + tokens.slice(splitIdx).join(" ") };
}

const text = readFileSync(SRC, "utf-8");
const lines = text.split("\n");

let section = "";
const markers = [];

for (const line of lines) {
  const secMatch = SECTION_LINE.exec(line.trim());
  if (secMatch && !/^\d/.test(line.trim())) {
    section = secMatch[2].trim();
    continue;
  }
  const prefix = MARKER_PREFIX.exec(line.trim());
  if (!prefix) continue;
  const [, nStr, remainder] = prefix;
  const { title, anchor, trailing } = splitMarker(remainder);
  const anchorRaw = anchor ?? "";
  const anchorWords = [...new Set((anchorRaw.match(ARABIC_RUN) ?? []).filter((w) => w.length >= 2))];
  const trailingArabicRuns = trailing.match(ARABIC_RUN) ?? [];
  // an embedded ayah citation reads as several consecutive Arabic words
  // right at the start of the trailing text, longer than a bare gloss
  const leadArabic = /^([؀-ۿݐ-ݿ\sۖ-ۭ۟ۖۗۘۙۚۛۜ٠-٩]{15,}?)[.ۚ.]\s/u.exec(trailing.trim());
  markers.push({
    n: Number(nStr),
    section,
    title_en: title,
    anchor_ar: anchorRaw,
    anchor_words: anchorWords,
    embedded_ayah: leadArabic ? leadArabic[1].trim() : null,
    text: `${title}${anchor ? ` (${anchorRaw})` : ""}${trailing}`.trim(),
    trailing_arabic_terms: [...new Set(trailingArabicRuns.filter((w) => w.length >= 3))],
  });
}

if (markers.length !== 30) {
  console.error(`build-qalam: expected 30 markers, parsed ${markers.length} — check references/qalam-30-markers.md formatting`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(path.join(OUT_DIR, "qalam-markers.json"), JSON.stringify(markers, null, 2), "utf-8");
console.log(`build-qalam: parsed ${markers.length} markers`);
