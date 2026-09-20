import type { WordRow } from "./types";
import type { LaneStateValues } from "../store/types";

/**
 * Real-time lane-state heuristic for the full-Quran canvas — the runtime
 * counterpart of scripts/gen-fixtures.mjs's computeLaneState, ported so it
 * can run client-side against ANY 15-ayah window instead of 3 precomputed
 * fixture pages. Same honesty rule: these five values are a heuristic
 * fixture computed live from real morphology, not detector output — see
 * data/SOURCES.md and docs/PHASE-01-UI-SYSTEM.md §6.
 *
 * ONE DELIBERATE REDUCTION from the Phase-1 fixture heuristic: the real
 * corpus word schema (data/README.md) carries root/lemma/pos_tag but not
 * the person/number/gender feature string the isnaad corpus exposed. F04
 * (perspective-shift) and the axis (address/speaker/absent) blend depended
 * entirely on that person tag, so this port cannot honestly compute them —
 * axis is reported as a neutral default and F04 is never assigned here.
 * Everything else (F01 rupture on قول, F06 passivity on verbless lanes, F09
 * rollback on root repetition, intensity/friction/depth) still works from
 * real signal.
 */
export interface LaneStateInput {
  rows: WordRow[];
  rootSeenBefore: Set<string>;
  maxWordCount: number;
}

const NEUTRAL_AXIS = { address: 0, speaker: 0, absent: 1 };

export function computeLaneState({ rows, rootSeenBefore, maxWordCount }: LaneStateInput): { state: LaneStateValues; rationale: string } {
  const wordCount = rows.length;
  const hasQawl = rows.some((r) => r[3] === "قول");
  const hasFiniteVerb = rows.some((r) => r[5] === "V");
  const repeatedRoots = rows.filter((r) => r[3] && rootSeenBefore.has(r[3]));

  let lens: LaneStateValues["lens"] = null;
  let rationale = "لا نمط مهيمن على هذا السطر — لا يُفرض عدسة حيث لا إشارة (product-spec/01).";
  if (hasQawl) {
    lens = "F01";
    rationale = "فعل قول يفتح صوتًا داخليًا محتملًا داخل السطر (جذر ق-و-ل).";
  } else if (!hasFiniteVerb && wordCount > 0) {
    lens = "F06";
    rationale = "لا فعل تامّ في السطر — مادة اسمية ساكنة (حمولة لا مشارك).";
  } else if (repeatedRoots.length > 0) {
    lens = "F09";
    rationale = `الجذر «${repeatedRoots[0][3]}» يعود بعد ورودٍ سابق في هذه الشاشة.`;
  }

  const repeatFraction = wordCount ? repeatedRoots.length / wordCount : 0;
  const intensity = clamp01(0.55 * (wordCount / Math.max(1, maxWordCount)) + 0.45 * repeatFraction);
  const friction = clamp01((hasQawl ? 0.4 : 0) + 0.4 * repeatFraction);

  return {
    state: {
      intensity: round3(intensity),
      friction: round3(friction),
      axis: { ...NEUTRAL_AXIS },
      lens,
      depth: round3(friction),
    },
    rationale,
  };
}

function clamp01(n: number): number { return Math.max(0, Math.min(1, n)); }
function round3(n: number): number { return Math.round(n * 1000) / 1000; }
