#!/usr/bin/env node
/**
 * Acceptance-test pins, in the isnaad `npm run verify` spirit (see
 * docs/REFERENCES.md §1 and CLAUDE.md "What to steal from each reference"):
 * passages pinned as tests so a change that stops finding them is wrong.
 * Re-derives everything from the corpus directly — it does not just re-run
 * the generator and diff against itself.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../data/pages");
const CORPUS_DIR = path.join(__dirname, "../../references/isnaad/data/corpus");

const REPO_DATA = path.join(__dirname, "../../data");

function loadData(...parts) {
  return JSON.parse(readFileSync(path.join(REPO_DATA, ...parts), "utf-8"));
}

let failed = 0;
function pin(name, ok, detail) {
  if (ok) {
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function loadPage(id) {
  return JSON.parse(readFileSync(path.join(DATA_DIR, `${id}.json`), "utf-8"));
}

function corpusWordCount(surah, ayah) {
  const text = readFileSync(path.join(CORPUS_DIR, `${surah}.txt`), "utf-8");
  const words = new Set();
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const [addr] = line.split("\t");
    const [a, w] = addr.split(":");
    if (Number(a) === ayah) words.add(Number(w));
  }
  return words.size;
}

console.log("Pinned passage 1 — الرحمٰن ٧–٩ (the وزن refrain, echo-trajectory material)");
{
  const p = loadPage("page-1");
  pin("page-1 has exactly 15 lanes", p.lanes.length === 15, `got ${p.lanes.length}`);
  const wazn = p.roots["وزن"] ?? [];
  pin("root وزن occurs on lanes 7, 8, and 9", [7, 8, 9].every((l) => wazn.includes(l)), JSON.stringify(wazn));
  pin("lane 7 word count matches corpus (الرحمٰن:7)", p.lanes[6].wordCount === corpusWordCount(55, 7));
}

console.log("Pinned passage 2 — الكهف ٦٣ (قال يفتتح المشهد الحواري)");
{
  const p = loadPage("page-2");
  const lane4 = p.lanes.find((l) => l.lane === 4);
  pin("lane 4 is ayah 63", lane4?.ayah === 63);
  pin("lane 4 carries the F01 rupture lens (قول detected)", lane4?.state.lens === "F01");
  pin("lane 4 is registered as a deep checkpoint", p.checkpoints.some((c) => c.lane === 4 && c.depth === "deep"));
  pin("lane 4 word count matches corpus (الكهف:63)", lane4?.wordCount === corpusWordCount(18, 63));
}

console.log("Pinned passage 3 — الناس + الفلق + الإخلاص (15 āyāt, three sūrahs)");
{
  const p = loadPage("page-3");
  pin("page-3 has exactly 15 lanes", p.lanes.length === 15, `got ${p.lanes.length}`);
  pin("lane 1 is الناس:1 and lane 15 is الإخلاص:4",
    p.lanes[0].surah === 114 && p.lanes[0].ayah === 1 && p.lanes[14].surah === 112 && p.lanes[14].ayah === 4);
  const shirr = p.roots["شرر"] ?? [];
  pin("root شرر recurs across all 5 evil-of/from clauses (lanes 4,8,9,10,11)",
    [4, 8, 9, 10, 11].every((l) => shirr.includes(l)), JSON.stringify(shirr));
}

console.log("\nCross-page invariants");
for (const id of ["page-1", "page-2", "page-3"]) {
  const p = loadPage(id);
  pin(`${id} provenance is labeled a fixture`, p.provenance?.isFixture === true);
  pin(`${id} lanes are numbered 1..15 without gaps or reorder`,
    p.lanes.every((l, i) => l.lane === i + 1));
  pin(`${id} every lane with lens=null carries a rationale saying so`,
    p.lanes.every((l) => l.state.lens !== null || l.rationale.includes("لا يُفرض")));
}

console.log("\nThe corpus and the rendering rule (data/README.md)");
{
  const ayat = loadData("quran", "ayat.json");
  const align = loadData("quran", "align.json");
  pin("the corpus is 6236 ayahs", ayat.length === 6236, String(ayat.length));

  // Regression pin. 110 ayahs carry a leading or doubled space — 2:1's text is
  // " الٓمٓ". Splitting on a single " " shifts every span in those ayahs by one,
  // which renders an empty word and leaves the real one untappable: exactly the
  // bug the Playwright walk caught. The rule is to split on runs of whitespace,
  // discarding empties.
  let irregular = 0;
  let overflow = 0;
  for (const row of ayat) {
    const naive = row[9].split(" ");
    const collapsed = row[9].trim().split(/\s+/);
    if (naive.length !== collapsed.length) irregular += 1;
    for (const [, to] of align[`${row[0]}:${row[1]}`] ?? []) if (to > collapsed.length) overflow += 1;
  }
  pin("ayahs with irregular whitespace are still present in the data", irregular === 110, String(irregular));
  pin("every alignment span fits the whitespace-collapsed split", overflow === 0, `${overflow} overflowing`);

  const bare = (text) => text.replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ]/g, "");
  // The same folding the app and the build share (src/sacred/normalize.ts,
  // scripts/build-data/build_infinite.py), plus whitespace and bidi marks:
  // blind to every spelling difference, so what is left over is alignment.
  const folded = (text) =>
    bare(text)
      .replace(/[\s​-‏]/g, "")
      .replace(/[ٱأإآ]/g, "ا")
      .replace(/[ىئ]/g, "ي")
      .replace(/ؤ/g, "و")
      .replace(/ة/g, "ه")
      .replace(/ء/g, "");
  let wordCountMismatch = 0;
  let spanTextMismatch = 0;
  let spanFoldMismatch = 0;
  const textOf = new Map(ayat.map((row) => [`${row[0]}:${row[1]}`, row[9].trim().split(/\s+/)]));
  for (let surah = 1; surah <= 114; surah += 1) {
    const byAyah = new Map();
    for (const row of loadData("quran", "words", `${String(surah).padStart(3, "0")}.json`)) {
      if (!byAyah.has(row[0])) byAyah.set(row[0], []);
      byAyah.get(row[0]).push(row);
    }
    for (const [ayah, rows] of byAyah) {
      const spans = align[`${surah}:${ayah}`] ?? [];
      if (spans.length !== rows.length) wordCountMismatch += 1;
      const tokens = textOf.get(`${surah}:${ayah}`) ?? [];
      spans.forEach(([from, to], index) => {
        const rendered = tokens.slice(from, to).join(" ");
        const stream = rows[index]?.[2] ?? "";
        if (bare(rendered) !== bare(stream)) spanTextMismatch += 1;
        if (folded(rendered) !== folded(stream)) spanFoldMismatch += 1;
      });
    }
  }
  pin("every ayah's alignment has one span per word", wordCountMismatch === 0, `${wordCountMismatch} ayahs`);
  // Eight of the 77429 words are spelled differently in the word stream than
  // in the ayah text, and all eight are artifacts of the stream, not of the
  // alignment: an internal space (5:52 دائر ة), a trailing space (11:31), a
  // stray RLM (27:26), a maddah written or not (70:1, 82:1, 108:1), and a
  // hamza / alef-wasla variant (11:13, 80:25). None can reach the screen —
  // the app renders from `ayat.json` and reads the stream only for roots —
  // so the count is recorded rather than swept up. A ninth means something
  // changed, and should fail.
  pin("the word stream and the ayah text disagree on exactly eight spellings",
    spanTextMismatch === 8, `${spanTextMismatch} of 77429`);
  // Blind to spelling, one word is still left: 11:13's ٱفترىه against the
  // stream's افتراه — an alef maqsūra where the stream writes a plain
  // alef. Folding those two together would also fold على into علا and make
  // the check blind to a real difference, so the exception is kept visible
  // instead. Everything else in the corpus aligns exactly.
  pin("blind to spelling, exactly one span differs — هود:١٣",
    spanFoldMismatch === 1, `${spanFoldMismatch} of 77429`);
}

console.log("\nThe infinite layer (FINALITY_PROMPT §7 — scripts/build-data/build_infinite.py)");
{
  const ayat = loadData("quran", "ayat.json");
  const real = new Set(ayat.map((row) => row[0] * 1000 + row[1]));

  const wordOcc = loadData("index", "word-occ.json");
  const rootOcc = loadData("index", "root-occ.json");
  const total = Object.values(wordOcc).reduce((sum, list) => sum + list.length, 0);
  pin("the word index covers all 77429 words", total === 77429, String(total));
  pin("the word index holds all 21295 distinct forms", Object.keys(wordOcc).length === 21295, String(Object.keys(wordOcc).length));
  pin("the root index holds all 1642 roots", Object.keys(rootOcc).length === 1642, String(Object.keys(rootOcc).length));

  let dangling = 0;
  for (const list of Object.values(rootOcc)) {
    for (const key of list) if (!real.has(Math.floor(key / 1000))) dangling += 1;
  }
  pin("every indexed occurrence points at a real ayah", dangling === 0, `${dangling} dangling`);

  const addressals = loadData("addressals", "addressals.json");
  pin("the vocative addressals are derived from the word stream", addressals.length > 40, String(addressals.length));
  pin("the most-addressed addressal is the one carried by 84 ayahs",
    addressals[0].n === 84 && addressals[0].phrase.includes("ءَامَنُوا۟"),
    `${addressals[0].phrase} ×${addressals[0].n}`);
  let addressalDangling = 0;
  for (const entry of addressals) {
    for (const [surah, ayah] of entry.loci) if (!real.has(surah * 1000 + ayah)) addressalDangling += 1;
  }
  pin("every addressal locus is a real ayah", addressalDangling === 0, `${addressalDangling} dangling`);

  const markers = loadData("markers", "markers.json");
  pin("all thirty QALAM markers are parsed", markers.length === 30, String(markers.length));
  const empty = markers.filter((marker) => marker.loci.length === 0).map((marker) => marker.n);
  pin("every marker resolved to real loci", empty.length === 0, `empty: ${empty.join(", ")}`);
  pin("marker 12's anchor الصخرة lands on الكهف:٦٣ and nowhere else",
    markers[11].loci.length === 1 && markers[11].loci[0][0] === 18 && markers[11].loci[0][1] === 63,
    JSON.stringify(markers[11].loci));
  pin("every marker records how each of its anchors was resolved",
    markers.every((m) => m.anchors.every((a) => ["exact", "root", "contains"].includes(a.how))));

  const walks = loadData("index", "paths.json");
  const anchored = loadData("index", "ayah-paths.json");
  const experiences = loadData("experiences", "experiences.json");
  pin("all 3354 catalogued experiences survive as walks", walks.length === experiences.length,
    `${walks.length} of ${experiences.length}`);
  // §9 removed the experiences browser: a walk is reachable only through the ◈
  // mark on an ayah it passes through. An unanchored walk would be content that
  // exists and cannot be reached — the one failure the "reached from the text by
  // gesture" rule cannot tolerate.
  const reachable = new Set();
  for (const ids of Object.values(anchored)) for (const id of ids) reachable.add(id);
  pin("every walk is reachable from at least one ayah's ◈ mark", reachable.size === walks.length,
    `${reachable.size} of ${walks.length}`);
  let walkDangling = 0;
  for (const walk of walks) for (const key of walk) if (!real.has(key)) walkDangling += 1;
  pin("every step of every walk is a real ayah", walkDangling === 0, `${walkDangling} dangling`);
}

console.log(failed === 0 ? `\nAll pins hold.` : `\n${failed} pin(s) broken.`);
process.exit(failed === 0 ? 0 : 1);
