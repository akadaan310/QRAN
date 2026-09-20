import { LANE_BASE_H, LANE_MIN_H, LANE_RANGE } from "./geometry";

/**
 * The equilibrium governor — spec-ui/00 pillar 4, spec-ui/01 §Equilibrium
 * rule, product-spec/02 §Layout pass: measure → claim → redistribute.
 *
 * Total lane height is held exactly constant at `n * LANE_BASE_H`. A lane's
 * intensity raises its claim above baseline; that surplus is paid for by
 * contracting the quietest lanes first, never below the legibility
 * minimum. If the deficit can't be fully absorbed without crossing that
 * floor, the remainder redistributes over the next-quietest lanes — a
 * short fixed-point loop, not an exact solver, which is adequate for 15
 * lanes and documented here rather than hidden.
 */
export interface GovernorInput {
  lane: number;
  intensity: number; // 0..1
  splitBoost?: number; // extra px a split/forked lane needs this frame
  /** Measured natural content height (line-wrapped text at rest). The
   * governor's own floor is a fixed constant that assumes short, single-
   * line content; a long āyah that wraps to two or three lines needs more
   * than that regardless of intensity — text is never compressed below
   * what it actually needs to render without overlapping its neighbors. */
  naturalMinHeight?: number;
}

export interface GovernorOutput {
  lane: number;
  height: number;
  claimed: number; // px above baseline this lane is claiming (can be negative)
}

export function runGovernor(inputs: GovernorInput[]): { lanes: GovernorOutput[]; breathClaimed: number } {
  const n = inputs.length;
  const floors = inputs.map((i) => Math.max(LANE_MIN_H, i.naturalMinHeight ?? 0) + (i.splitBoost ?? 0));
  const raw = inputs.map((i, idx) => Math.max(LANE_BASE_H + i.intensity * LANE_RANGE + (i.splitBoost ?? 0), floors[idx]));
  const totalDelta = raw.reduce((a, b, idx) => a + (b - LANE_BASE_H - (inputs[idx].splitBoost ?? 0)), 0);

  // weights favor contracting the quietest (lowest-intensity) lanes first
  let remaining = inputs.map((_, idx) => idx);
  let heights = raw.slice();
  let deficitToDistribute = totalDelta;

  for (let pass = 0; pass < 4 && remaining.length > 0 && Math.abs(deficitToDistribute) > 0.01; pass++) {
    const weightSum = remaining.reduce((a, idx) => a + (1 - inputs[idx].intensity) + 0.001, 0);
    const stillRemaining: number[] = [];
    let distributedThisPass = 0;

    for (const idx of remaining) {
      const w = ((1 - inputs[idx].intensity) + 0.001) / weightSum;
      const share = deficitToDistribute * w;
      const proposed = heights[idx] - share;
      const floor = floors[idx];
      if (proposed < floor) {
        distributedThisPass += heights[idx] - floor;
        heights[idx] = floor;
      } else {
        heights[idx] = proposed;
        distributedThisPass += share;
        stillRemaining.push(idx);
      }
    }
    deficitToDistribute -= distributedThisPass;
    remaining = stillRemaining;
  }

  const lanes: GovernorOutput[] = inputs.map((input, idx) => ({
    lane: input.lane,
    height: Math.round(heights[idx] * 100) / 100,
    claimed: Math.round((heights[idx] - LANE_BASE_H - (input.splitBoost ?? 0)) * 100) / 100,
  }));

  const maxPossibleDelta = n * LANE_RANGE;
  const breathClaimed = maxPossibleDelta > 0 ? Math.max(0, Math.min(1, totalDelta / maxPossibleDelta)) : 0;

  return { lanes, breathClaimed };
}
