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

console.log(failed === 0 ? `\nAll pins hold.` : `\n${failed} pin(s) broken.`);
process.exit(failed === 0 ? 0 : 1);
