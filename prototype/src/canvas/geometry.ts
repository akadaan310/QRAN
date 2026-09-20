// Canvas geometry constants — spec-ui/01. The page bound is immutable;
// these numbers define the rigid footprint the governor breathes inside of.

export const LANE_COUNT = 15;
export const GUTTER_COUNT = 14;

// Sized to actually contain the Arabic line box (font-size up to 34px at
// line-height 1.9-1.95, spec-ui/05), not just a nominal row height — an
// under-sized lane lets the text visually overflow into the gutter below
// it, which breaks gutter/rail hit-testing as well as the layout contract.
export const LANE_BASE_H = 60; // px, baseline row height at intensity 0
export const LANE_MIN_H = 52; // px, sacred legibility minimum — never crossed
export const LANE_RANGE = 30; // px, max extra height a fully-intense lane can claim
export const LANE_SPLIT_H = 112; // px, height budget a split (forked) lane may claim

export const PAGE_HEIGHT_BUDGET = LANE_COUNT * LANE_BASE_H; // the constant H
