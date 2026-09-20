import type { PageFixture, LaneFixture, WordFixture, CheckpointFixture } from "../store/types";
import type { Locus } from "./types";
import { loadSurahWords, surahByNumber } from "./loaders";
import { toRasmSkeleton } from "./rasm";
import { computeLaneState } from "./laneState";

/**
 * Builds a PageFixture (the exact shape the existing canvas/render.ts,
 * governor, gestures and HUD already consume — untouched, per "extend it,
 * don't rewrite it") from a real window of loci anywhere in the Quran.
 * This is the full-corpus counterpart of scripts/gen-fixtures.mjs, running
 * client-side against real, on-demand-fetched data instead of 3 baked
 * fixture files.
 */
export async function buildScreen(id: string, loci: Locus[]): Promise<PageFixture> {
  const surahNums = [...new Set(loci.map((l) => l.surah))];
  const [surahMeta, wordSets] = await Promise.all([
    Promise.all(surahNums.map((n) => surahByNumber(n))),
    Promise.all(surahNums.map((n) => loadSurahWords(n))),
  ]);
  const nameByNum = new Map(surahMeta.filter(Boolean).map((s) => [s!.n, s!.ar]));
  const wordsBySurah = new Map(surahNums.map((n, idx) => [n, wordSets[idx]]));

  const rowsByLocus = loci.map((l) => (wordsBySurah.get(l.surah) ?? []).filter((r) => r[0] === l.ayah).sort((a, b) => a[1] - b[1]));
  const maxWordCount = Math.max(1, ...rowsByLocus.map((r) => r.length));

  const lanes: LaneFixture[] = [];
  const rootLanes = new Map<string, number[]>();
  const rootSeenBefore = new Set<string>();
  const checkpoints: CheckpointFixture[] = [];

  loci.forEach((locus, idx) => {
    const laneNo = idx + 1;
    const rows = rowsByLocus[idx];
    const { state, rationale } = computeLaneState({ rows, rootSeenBefore, maxWordCount });

    if (state.friction >= 0.55) {
      checkpoints.push({
        lane: laneNo,
        depth: state.friction >= 0.7 ? "deep" : "shallow",
        label: `${nameByNum.get(locus.surah) ?? locus.surah} ${locus.ayah}`,
        note: rationale,
      });
    }

    const rootsThisLane = new Set(rows.map((r) => r[3]).filter((r): r is string => Boolean(r)));
    for (const root of rootsThisLane) {
      if (!rootLanes.has(root)) rootLanes.set(root, []);
      rootLanes.get(root)!.push(laneNo);
      rootSeenBefore.add(root);
    }

    const words: WordFixture[] = rows.map((r) => ({
      i: r[1],
      marked: r[2],
      skeleton: toRasmSkeleton(r[2]),
      pos: r[5],
      root: r[3],
      lemma: r[4],
      person: null,
    }));

    lanes.push({
      lane: laneNo,
      surah: locus.surah,
      surahName: nameByNum.get(locus.surah) ?? String(locus.surah),
      ayah: locus.ayah,
      words,
      wordCount: words.length,
      state,
      rationale,
    });
  });

  const roots: Record<string, number[]> = {};
  for (const [root, laneList] of rootLanes) if (laneList.length >= 2) roots[root] = laneList;

  return {
    id,
    title: describeScreen(loci, nameByNum),
    sourceSurahs: surahNums.map((n) => ({ number: n, name: nameByNum.get(n) ?? String(n), ayahFrom: 0, ayahTo: 0 })),
    lanes,
    roots,
    checkpoints,
    provenance: {
      corpus: surahNums.map((n) => `data/quran/words/${String(n).padStart(3, "0")}.json`),
      corpusSource: "Quran.com API v4 (CC-BY-4.0) + Quranic Arabic Corpus v0.4 (GPL), vendored under data/quran — see data/SOURCES.md",
      method: "heuristic lane-state computed live in the browser (src/data/laneState.ts) from real root/pos morphology — not detector output. Axis is neutral (no person-tag field in this word schema); F04 is never assigned here. See docs/PHASE-01-UI-SYSTEM.md §6.",
      isFixture: true,
      generatedBy: "src/data/screenBuilder.ts",
      generatedAt: new Date().toISOString(),
    },
  };
}

function describeScreen(loci: Locus[], nameByNum: Map<number, string>): string {
  if (loci.length === 0) return "";
  const first = loci[0];
  const last = loci[loci.length - 1];
  const firstName = nameByNum.get(first.surah) ?? String(first.surah);
  if (first.surah === last.surah) return `${firstName} ${first.ayah}–${last.ayah}`;
  const lastName = nameByNum.get(last.surah) ?? String(last.surah);
  return `${firstName} ${first.ayah} – ${lastName} ${last.ayah}`;
}
