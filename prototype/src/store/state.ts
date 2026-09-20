import type { ViewportState, PageFixture, LensId, Track } from "./types";

type Listener = (state: ViewportState, prev: ViewportState) => void;

function initialState(pageId: string): ViewportState {
  return {
    pageId,
    focusedLane: null,
    activeLenses: [],
    gutterSpeed: 0,
    gutterIndex: null,
    hud: "rest",
    computedLensTargets: {},
    orbit: { active: false, hubLane: null, hubWordIndex: null, hubRoot: null, landedLanes: [] },
    lock: { active: false, boundaryLane: null, recoveredUpTo: null },
    rasm: { active: false },
    splitLanes: [],
    isolatedLane: null,
    railDensity: "expanded",
    track: { mode: "runway", pinned: false },
    breathClaimed: 0,
    authoredCheckpoints: [],
  };
}

/**
 * The single explicit viewport-state record (product-spec/02 §State model).
 * Deliberately not a framework store: one object, one set of listeners, one
 * mutation entrypoint (`update`). Small enough to persist verbatim as
 * NavigationState.
 */
export class Store {
  private state: ViewportState;
  private listeners = new Set<Listener>();
  readonly page: PageFixture;

  constructor(page: PageFixture) {
    this.page = page;
    this.state = initialState(page.id);
  }

  get(): ViewportState {
    return this.state;
  }

  update(patch: Partial<ViewportState> | ((s: ViewportState) => Partial<ViewportState>)): void {
    const prev = this.state;
    const p = typeof patch === "function" ? patch(prev) : patch;
    this.state = { ...prev, ...p };
    for (const l of this.listeners) l(this.state, prev);
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  laneById(lane: number) {
    return this.page.lanes.find((l) => l.lane === lane) ?? null;
  }

  setHud(hud: ViewportState["hud"]): void {
    if (this.state.hud !== hud) this.update({ hud });
  }

  toggleLens(lens: LensId): void {
    if (!lens) return;
    const has = this.state.activeLenses.includes(lens);
    this.update({ activeLenses: has ? this.state.activeLenses.filter((l) => l !== lens) : [...this.state.activeLenses, lens] });
  }

  setTrack(mode: Track, pinned = false): void {
    this.update({ track: { mode, pinned } });
  }
}
