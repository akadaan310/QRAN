// Shared types. Lane state's five values are the only inputs typography,
// HUD, and features may read — product-spec/01 §Stage C.

export type LensId =
  | "F01" | "F02" | "F03" | "F04" | "F05"
  | "F06" | "F07" | "F08" | "F09" | null;

export interface AxisBlend {
  address: number;
  speaker: number;
  absent: number;
}

export interface LaneStateValues {
  intensity: number;
  friction: number;
  axis: AxisBlend;
  lens: LensId;
  depth: number;
}

export interface WordFixture {
  i: number;
  marked: string;
  skeleton: string;
  pos: string;
  root: string | null;
  lemma: string | null;
  person: string | null;
}

export interface LaneFixture {
  lane: number;
  surah: number;
  surahName: string;
  ayah: number;
  words: WordFixture[];
  wordCount: number;
  state: LaneStateValues;
  rationale: string;
}

export interface CheckpointFixture {
  lane: number;
  depth: "shallow" | "deep";
  label: string;
  note: string;
}

export interface PageFixture {
  id: string;
  title: string;
  sourceSurahs: { number: number; name: string; ayahFrom: number; ayahTo: number }[];
  lanes: LaneFixture[];
  roots: Record<string, number[]>;
  checkpoints: CheckpointFixture[];
  provenance: {
    corpus: string[];
    corpusSource: string;
    method: string;
    isFixture: true;
    generatedBy: string;
    generatedAt: string;
  };
}

export type HudState = "rest" | "tracking" | "locked" | "lens" | "orbit" | "rasm";
export type Track = "runway" | "excavator" | "collider";
export type GutterSpeed = 0 | 1 | 2 | 3;

export interface OrbitState {
  active: boolean;
  hubLane: number | null;
  hubWordIndex: number | null;
  hubRoot: string | null;
  landedLanes: number[];
}

export interface LockState {
  active: boolean;
  boundaryLane: number | null;
  recoveredUpTo: number | null; // lane the reader has reverse-walked back to
}

export interface RasmState {
  active: boolean;
}

// The restorable viewport record — product-spec/02 §State model /
// product-spec/05 NavigationState. Everything else is derived from this.
export interface ViewportState {
  pageId: string;
  focusedLane: number | null;
  activeLenses: LensId[];
  gutterSpeed: GutterSpeed;
  gutterIndex: number | null; // which gutter (between lane n and n+1) is pressed
  hud: HudState;
  /** Lanes currently showing a *computed* (not fixture-assigned) lens
   * effect — F02/F03/F05/F07/F08, triggered generically off the focused
   * lane rather than pre-tagged in the fixture. See features/lensRail.ts. */
  computedLensTargets: Partial<Record<Exclude<LensId, null>, number[]>>;
  orbit: OrbitState;
  lock: LockState;
  rasm: RasmState;
  splitLanes: number[]; // lanes currently row-split (F01/F14)
  isolatedLane: number | null; // F18 margin cell isolation
  railDensity: "spine" | "expanded" | "full";
  track: { mode: Track; pinned: boolean };
  breathClaimed: number; // 0..1, fraction of page's space budget claimed
  authoredCheckpoints: CheckpointFixture[];
}

export interface Discovery {
  id: string;
  pageId: string;
  lane: number;
  lens: LensId;
  friction: number;
  auditRef: string | null;
  note: string;
  createdAt: string;
  supersedes: string | null;
}

export interface Checkpoint {
  id: string;
  pageId: string;
  lane: number;
  label: string;
  note: string;
  depth: "shallow" | "deep";
  authoredByTrack: Track;
  createdAt: string;
}

export interface NavigationStateRecord {
  deviceId: string;
  pageId: string;
  focusedLane: number | null;
  activeLenses: LensId[];
  hudDensity: ViewportState["railDensity"];
  orbitHub: { lane: number; wordIndex: number } | null;
  rasmOn: boolean;
  track: Track;
  trackPinned: boolean;
  updatedAt: string;
}

export interface PageSessionRecord {
  id: string;
  pageId: string;
  track: Track;
  startedAt: string;
  endedAt: string | null;
  deepestLensSpeed: GutterSpeed;
  locksEncountered: number;
  locksResolved: number;
  discoveriesCount: number;
}
