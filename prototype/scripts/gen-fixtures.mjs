#!/usr/bin/env node
/**
 * Fixture generator — source of truth for prototype/data/pages/*.json.
 *
 * Reads real vendored Uthmani text + QAC v0.4 morphology from
 * references/isnaad/data/corpus/<surah>.txt (word-per-line: "ayah:word:sub
 * <TAB> token <TAB> POS <TAB> features"; see references/isnaad/README.md).
 * Never hand-edit the generated JSON — fix this script and rerun
 * `npm run fixtures`.
 *
 * MEASUREMENT HONESTY. The five lane-state values (intensity, friction,
 * axis, lens, depth) that product-spec/01 describes as pipeline output from
 * three repositories are, here, a *heuristic derivation this script makes
 * directly from real per-word morphology* (root repetition on the page,
 * person-tag blend, presence of a direct-speech verb). They are NOT the
 * output of isnaad's detector engine or al-Mirtal's edge weights run
 * against these specific loci — no such run exists for these pages. Every
 * generated page carries `provenance.isFixture: true` and a method string
 * saying exactly this. Per product-spec/01 "Pipeline integrity": a lane
 * with no qualifying signal gets `lens: null` — the absence is data, never
 * a forced value.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");
const CORPUS_DIR = path.join(REPO_ROOT, "references/isnaad/data/corpus");
const OUT_DIR = path.join(__dirname, "../data/pages");

const SURAH_NAMES = {
  55: "الرحمٰن", 18: "الكهف", 114: "الناس", 113: "الفلق", 112: "الإخلاص",
};

// -- rasm skeleton normalization -------------------------------------------
// A *visual approximation* for the F17 rasm-reveal gesture demo, not a
// paleographic authority: strips harakat/tatweel, then folds each dotted
// letter onto the base stroke its dots were added to historically. Grouping
// choices and rationale are recorded in prototype/data/SOURCES.md.
const HARAKAT = /[ؐ-ًؚ-ٰٟۖ-ۭࣔ-ࣿـ]/g;
const RASM_MAP = {
  "ب":"ب","ت":"ب","ة":"ه","ث":"ب","ن":"ب","ي":"ب","ى":"ب","ئ":"ب",
  "ج":"ح","ح":"ح","خ":"ح",
  "د":"د","ذ":"د",
  "ر":"ر","ز":"ر",
  "س":"س","ش":"س",
  "ص":"ص","ض":"ص",
  "ط":"ط","ظ":"ط",
  "ع":"ع","غ":"ع",
  "ف":"ف","ق":"ق","ك":"ك","ل":"ل","م":"م","ه":"ه",
  "و":"و","ؤ":"و",
  "ا":"ا","أ":"ا","إ":"ا","آ":"ا","ء":"ا","ٱ":"ا","ٰ":"ا",
};
function toSkeleton(marked) {
  const bare = marked.normalize("NFC").replace(HARAKAT, "");
  let out = "";
  for (const ch of bare) out += RASM_MAP[ch] ?? ch;
  return out;
}

// -- corpus parsing ---------------------------------------------------------
function parseCorpus(surah) {
  const text = readFileSync(path.join(CORPUS_DIR, `${surah}.txt`), "utf-8");
  const byAyah = new Map();
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const [addr, token, pos, features] = line.split("\t");
    const [ayahStr, wordStr] = addr.split(":");
    const ayah = Number(ayahStr);
    const wi = Number(wordStr);
    if (!byAyah.has(ayah)) byAyah.set(ayah, new Map());
    const words = byAyah.get(ayah);
    // sub-word tokens (prefixes/suffixes) concatenate onto the same word index
    const prev = words.get(wi);
    const feat = features ?? "";
    const root = /ROOT:([^\|]+)/.exec(feat)?.[1] ?? null;
    const lemma = /LEM:([^\|]+)/.exec(feat)?.[1] ?? null;
    const person = /\b([123])(F?M?)(S|D|P)\b/.exec(feat);
    if (prev) {
      prev.marked += token;
      if (root && !prev.root) prev.root = root;
      if (pos === "V") prev.pos = "V";
    } else {
      words.set(wi, {
        i: wi,
        marked: token,
        pos,
        root,
        lemma,
        person: person ? `${person[1]}${person[2]}${person[3]}` : null,
        isQawl: root === "قول",
      });
    }
  }
  const out = new Map();
  for (const [ayah, words] of byAyah) {
    out.set(ayah, [...words.values()].sort((a, b) => a.i - b.i));
  }
  return out;
}

function personPole(tag) {
  // three-pole axis per product-spec/03: address (2nd) / speaker (1st) / absent (3rd)
  if (!tag) return null;
  if (tag.startsWith("1")) return "speaker";
  if (tag.startsWith("2")) return "address";
  if (tag.startsWith("3")) return "absent";
  return null;
}

function buildLaneWords(rawWords) {
  return rawWords.map((w) => ({
    i: w.i,
    marked: w.marked,
    skeleton: toSkeleton(w.marked),
    pos: w.pos,
    root: w.root,
    lemma: w.lemma,
    person: w.person,
  }));
}

/**
 * Assigns lane-state values from real, checkable signals only. See module
 * docstring — this is the fixture heuristic, not detector output.
 */
function computeLaneState(rawWords, { rootSeenBefore, prevAxisPole, maxWordCount }) {
  const wordCount = rawWords.length;
  const poles = { address: 0, speaker: 0, absent: 0 };
  let anyPole = 0;
  for (const w of rawWords) {
    const p = personPole(w.person);
    if (p) { poles[p]++; anyPole++; }
  }
  const axis = anyPole
    ? { address: poles.address / anyPole, speaker: poles.speaker / anyPole, absent: poles.absent / anyPole }
    : { address: 0, speaker: 0, absent: 1 };
  const dominantPole = anyPole
    ? Object.entries(poles).sort((a, b) => b[1] - a[1])[0][0]
    : "absent";

  const hasQawl = rawWords.some((w) => w.isQawl);
  const hasFiniteVerb = rawWords.some((w) => w.pos === "V");
  const repeatedRoots = rawWords.filter((w) => w.root && rootSeenBefore.has(w.root));
  const axisShifted = prevAxisPole !== null && dominantPole !== prevAxisPole && anyPole > 0;

  let lens = null;
  let rationale = "لا نمط مهيمن على هذا السطر — لا يُفرض عدسة حيث لا إشارة (product-spec/01).";
  if (hasQawl) {
    lens = "F01";
    rationale = "فعل قول يفتح صوتًا داخليًا محتملًا داخل السطر (جذر ق-و-ل).";
  } else if (axisShifted) {
    lens = "F04";
    rationale = `انعطاف محور الإسناد من ${prevAxisPole === "address" ? "الخطاب" : prevAxisPole === "speaker" ? "التكلم" : "الغَيبة"} إلى ${dominantPole === "address" ? "الخطاب" : dominantPole === "speaker" ? "التكلم" : "الغَيبة"}.`;
  } else if (!hasFiniteVerb && wordCount > 0) {
    lens = "F06";
    rationale = "لا فعل تامّ في السطر — مادة اسمية ساكنة (حمولة لا مشارك).";
  } else if (repeatedRoots.length > 0) {
    lens = "F09";
    rationale = `الجذر «${repeatedRoots[0].root}» يعود بعد ورودٍ سابق في الصفحة.`;
  }

  const repeatFraction = wordCount ? repeatedRoots.length / wordCount : 0;
  const intensity = clamp01(0.55 * (wordCount / Math.max(1, maxWordCount)) + 0.45 * repeatFraction);
  const friction = clamp01(
    (hasQawl ? 0.35 : 0) + (axisShifted ? 0.35 : 0) + 0.3 * repeatFraction
  );
  const depth = friction; // friction maps to z-lift, spec-ui/05

  return {
    intensity: round3(intensity),
    friction: round3(friction),
    axis: { address: round3(axis.address), speaker: round3(axis.speaker), absent: round3(axis.absent) },
    axisPole: dominantPole,
    lens,
    depth: round3(depth),
    rationale,
  };
}

function clamp01(n) { return Math.max(0, Math.min(1, n)); }
function round3(n) { return Math.round(n * 1000) / 1000; }

function buildPage({ id, title, segments }) {
  const lanes = [];
  const rootLanes = new Map(); // root -> [lane numbers]
  const rootSeenBefore = new Set();
  const checkpoints = [];
  let prevAxisPole = null;
  let laneNo = 0;
  let maxWordCount = 1;

  const parsedAyahsBySurah = new Map();
  for (const seg of segments) {
    if (!parsedAyahsBySurah.has(seg.surah)) parsedAyahsBySurah.set(seg.surah, parseCorpus(seg.surah));
  }
  for (const seg of segments) {
    const bySurah = parsedAyahsBySurah.get(seg.surah);
    for (let ayah = seg.ayahFrom; ayah <= seg.ayahTo; ayah++) {
      maxWordCount = Math.max(maxWordCount, (bySurah.get(ayah) ?? []).length);
    }
  }

  for (const seg of segments) {
    const bySurah = parsedAyahsBySurah.get(seg.surah);
    for (let ayah = seg.ayahFrom; ayah <= seg.ayahTo; ayah++) {
      laneNo += 1;
      const rawWords = bySurah.get(ayah);
      if (!rawWords) throw new Error(`missing ${seg.surah}:${ayah} in corpus`);

      const state = computeLaneState(rawWords, { rootSeenBefore, prevAxisPole, maxWordCount });

      if (state.friction >= 0.55) {
        checkpoints.push({
          lane: laneNo,
          depth: state.friction >= 0.7 ? "deep" : "shallow",
          label: `${SURAH_NAMES[seg.surah]} ${ayah}`,
          note: state.rationale,
        });
      }

      const rootsThisLane = new Set(rawWords.map((w) => w.root).filter(Boolean));
      for (const root of rootsThisLane) {
        if (!rootLanes.has(root)) rootLanes.set(root, []);
        rootLanes.get(root).push(laneNo);
        rootSeenBefore.add(root);
      }

      lanes.push({
        lane: laneNo,
        surah: seg.surah,
        surahName: SURAH_NAMES[seg.surah],
        ayah,
        words: buildLaneWords(rawWords),
        wordCount: rawWords.length,
        state: {
          intensity: state.intensity,
          friction: state.friction,
          axis: state.axis,
          lens: state.lens,
          depth: state.depth,
        },
        rationale: state.rationale,
      });
      prevAxisPole = state.axisPole;
    }
  }

  const roots = {};
  for (const [root, laneList] of rootLanes) {
    if (laneList.length >= 2) roots[root] = laneList;
  }

  return {
    id,
    title,
    sourceSurahs: segments.map((s) => ({ number: s.surah, name: SURAH_NAMES[s.surah], ayahFrom: s.ayahFrom, ayahTo: s.ayahTo })),
    lanes,
    roots,
    checkpoints,
    provenance: {
      corpus: segments.map((s) => `references/isnaad/data/corpus/${s.surah}.txt`),
      corpusSource: "Tanzil Uthmani text + Quranic Arabic Corpus v0.4 morphology, vendored by references/isnaad (see its README.md and docs/PROJECT.md)",
      method: "heuristic fixture derivation (prototype/scripts/gen-fixtures.mjs) from real per-word morphology — root repetition on the page, person-tag axis blend, direct-speech verb detection. NOT raw isnaad-detector or al-Mirtal-edge output for these loci.",
      isFixture: true,
      generatedBy: "scripts/gen-fixtures.mjs",
      generatedAt: new Date().toISOString(),
    },
  };
}

const PAGES = [
  {
    id: "page-1",
    title: "الرحمٰن ١–١٥",
    segments: [{ surah: 55, ayahFrom: 1, ayahTo: 15 }],
  },
  {
    id: "page-2",
    title: "الكهف ٦٠–٧٤",
    segments: [{ surah: 18, ayahFrom: 60, ayahTo: 74 }],
  },
  {
    id: "page-3",
    title: "الناس · الفلق · الإخلاص",
    segments: [
      { surah: 114, ayahFrom: 1, ayahTo: 6 },
      { surah: 113, ayahFrom: 1, ayahTo: 5 },
      { surah: 112, ayahFrom: 1, ayahTo: 4 },
    ],
  },
];

mkdirSync(OUT_DIR, { recursive: true });
for (const spec of PAGES) {
  const page = buildPage(spec);
  if (page.lanes.length !== 15) {
    throw new Error(`${spec.id}: expected 15 lanes, got ${page.lanes.length}`);
  }
  const outPath = path.join(OUT_DIR, `${spec.id}.json`);
  writeFileSync(outPath, JSON.stringify(page, null, 2) + "\n", "utf-8");
  console.log(`wrote ${path.relative(REPO_ROOT, outPath)} — ${page.lanes.length} lanes, ${Object.keys(page.roots).length} repeated roots`);
}
