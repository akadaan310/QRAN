#!/usr/bin/env node
/**
 * Derives runtime search indices from data/quran/words/*.json that the raw
 * data layer doesn't itself provide: every root's occurrence loci (roots.json
 * only carries a *count*, `n`), every exact word-form's occurrence loci, and
 * every vocative addressal ("يا ...") phrase with its occurrences — the
 * basis for §7.2 word/root pages and §7.3 archetype addressee journeys.
 *
 * Output goes to prototype/public/data/derived/ (generated, gitignored like
 * the rest of public/data/) — never hand-edited; rerun via
 * `npm run predev`/`prebuild`, which call this after sync-data.mjs.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORDS_DIR = path.resolve(__dirname, "../public/data/quran/words");
const OUT_DIR = path.resolve(__dirname, "../public/data/derived");

const HARAKAT = /[ؐ-ًؚ-ٰٟۖ-ۭࣔ-ࣿـ]/g;
function normalize(s) {
  return s.normalize("NFC").replace(HARAKAT, "").replace(/[آأإٱ]/g, "ا");
}
// Vocative-specific normalization: unlike normalize() above (which drops
// dagger-alif U+0670 entirely -- fine for exact word-form matching), this
// keeps it as a real alif, because the vocative prefix spelled with a
// dagger-alif stands in for a real ا. Dropping it breaks character
// alignment between the "يا" prefix and what follows it.
function normalizeVocative(s) {
  // order matters: replace the dagger-alif/hamza variants BEFORE HARAKAT
  // strips them to nothing (U+0670 is inside HARAKAT's stripped range).
  // Also folds alef-maqsura (ى) to yaa (ي) — both spell the same final
  // sound in this corpus (بَنِىٓ vs بني), and callers pass plain-yaa forms.
  return s.normalize("NFC").replace(/[آأإٱٰ]/g, "ا").replace(HARAKAT, "").replace(/ى/g, "ي");
}

const rootIndex = new Map(); // root -> [[s,a,pos], ...]
const wordIndex = new Map(); // normalized (diacritic-stripped) surface form -> [[s,a,pos], ...]
const wordToRoot = new Map(); // normalized surface form -> root (first seen; words are ~always one root)
// exact (NFC-normalized only, diacritics kept) surface form -> [[s,a,pos], ...]
// — this is the granularity data/lexicon/words.json's 21295 entries use
// (case-ending-sensitive); word pages (§7.2) index against this, not the
// diacritic-stripped `wordIndex` above, which conflates grammatical cases.
const wordIndexExact = new Map();

// Vocative detection — see docs/PHASE-01-UI-SYSTEM.md §6 for the documented
// limits of this rule (it is not a full parser of Arabic syntax). The
// vocative particle يا is never its own space-delimited token in this
// corpus; it fuses orthographically with its addressee into one token
// (confirmed against align.json: "يَـٰمُوسَىٰٓ" is one token in the real
// mushaf text, not two). The fusion is distinguishable from an unrelated
// hamza-initial verb (e.g. يَأْتِيَ "he comes") by its exact diacritic
// signature: ي + fatha(U+064E, optional) + tatweel(U+0640) +
// dagger-alif(U+0670) — verified empirically against the full corpus
// (340 matches, 0 false positives from hamza-initial verbs, which use
// U+0623 immediately after ي with no tatweel/dagger-alif).
const VOCATIVE_FUSION = /^يَ?ـٰ/;
// A handful of addressee bases are themselves incomplete without a
// following noun/clause (يَـٰٓأَيُّهَا ٱلنَّاسُ, يَـٰبَنِىٓ ءَادَمَ) — extend
// the phrase by one token when the fused addressee normalizes to one of
// these, and by one more when that token is a relative pronoun.
const CONTINUE_AFTER = new Set(["ايها", "ايتها", "بني", "بنات", "اهل", "معشر"].map(normalizeVocative));
const EXTEND_ONE_MORE = new Set(["الذين", "الذي", "التي", "اللذين", "اللاتي"].map(normalizeVocative));

const vocatives = new Map(); // normalized phrase -> { display, loci: [[s,a]], words:[[s,a,posFrom,posTo]] }

const files = readdirSync(WORDS_DIR).filter((f) => f.endsWith(".json")).sort();
for (const file of files) {
  const surah = Number(file.replace(".json", ""));
  const rows = JSON.parse(readFileSync(path.join(WORDS_DIR, file), "utf-8"));
  // group by ayah so vocative-window logic can look ahead within the ayah
  const byAyah = new Map();
  for (const [ayah, pos, text, root] of rows) {
    if (!byAyah.has(ayah)) byAyah.set(ayah, []);
    byAyah.get(ayah).push({ pos, text, root });

    if (root) {
      if (!rootIndex.has(root)) rootIndex.set(root, []);
      rootIndex.get(root).push([surah, ayah, pos]);
    }
    const norm = normalize(text);
    if (!wordIndex.has(norm)) wordIndex.set(norm, []);
    wordIndex.get(norm).push([surah, ayah, pos]);
    if (root && !wordToRoot.has(norm)) wordToRoot.set(norm, root);
    const exact = text.normalize("NFC");
    if (!wordIndexExact.has(exact)) wordIndexExact.set(exact, []);
    wordIndexExact.get(exact).push([surah, ayah, pos]);
  }

  for (const [ayah, words] of byAyah) {
    words.sort((a, b) => a.pos - b.pos);
    for (let i = 0; i < words.length; i++) {
      if (!VOCATIVE_FUSION.test(words[i].text)) continue;
      const fusedNorm = normalizeVocative(words[i].text);
      const addresseeBase = fusedNorm.replace(/^يا/, "");
      const parts = [words[i]];
      if (CONTINUE_AFTER.has(addresseeBase)) {
        let j = i + 1;
        if (j < words.length) {
          parts.push(words[j]);
          if (EXTEND_ONE_MORE.has(normalizeVocative(words[j].text)) && j + 1 < words.length) {
            j++;
            parts.push(words[j]);
          }
        }
      }
      const display = parts.map((w) => w.text).join(" ");
      const key = parts.map((w) => normalizeVocative(w.text)).join(" ");
      if (!vocatives.has(key)) vocatives.set(key, { display, loci: [], words: [] });
      const v = vocatives.get(key);
      v.loci.push([surah, ayah]);
      v.words.push([surah, ayah, parts[0].pos, parts[parts.length - 1].pos]);
    }
  }
}

mkdirSync(OUT_DIR, { recursive: true });

writeFileSync(path.join(OUT_DIR, "root-occurrences.json"), JSON.stringify(Object.fromEntries(rootIndex)), "utf-8");
writeFileSync(path.join(OUT_DIR, "word-occurrences.json"), JSON.stringify(Object.fromEntries(wordIndex)), "utf-8");
writeFileSync(path.join(OUT_DIR, "word-occurrences-exact.json"), JSON.stringify(Object.fromEntries(wordIndexExact)), "utf-8");
writeFileSync(path.join(OUT_DIR, "word-to-root.json"), JSON.stringify(Object.fromEntries(wordToRoot)), "utf-8");

const vocativeList = [...vocatives.entries()]
  .map(([key, v]) => ({ key, display: v.display, count: v.loci.length, loci: v.loci, words: v.words }))
  .filter((v) => v.count >= 1)
  .sort((a, b) => b.count - a.count);
writeFileSync(path.join(OUT_DIR, "vocatives.json"), JSON.stringify(vocativeList), "utf-8");

console.log(`build-index: ${rootIndex.size} roots, ${wordIndex.size} normalized word-forms, ${wordIndexExact.size} exact word-forms, ${vocativeList.length} vocative phrases`);
