import type { Store } from "../store/state";
import type { LaneFixture, ViewportState, WordFixture } from "../store/types";
import { runGovernor } from "./governor";
import { LANE_BASE_H, LANE_SPLIT_H } from "./geometry";

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, attrs?: Record<string, string>): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (attrs) for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

function renderWordSpans(words: WordFixture[], variant: "marked" | "skeleton"): HTMLElement[] {
  return words.map((w) => {
    const span = el("span", "word", { "data-word": String(w.i) });
    if (w.root) span.dataset.root = w.root;
    span.textContent = variant === "marked" ? w.marked : w.skeleton;
    return span;
  });
}

interface LaneEls {
  root: HTMLElement;
  seam: HTMLElement;
  textStack: HTMLElement;
  marked: HTMLElement;
  skeleton: HTMLElement;
  rings: HTMLElement;
  before: HTMLElement;
  after: HTMLElement;
}

interface GutterEls {
  root: HTMLElement;
  depthLabel: HTMLElement;
}

interface RailCellEls {
  root: HTMLElement;
  ticker?: HTMLElement;
  tickerMarker?: HTMLElement;
  rigidityTicks?: HTMLElement[];
  checkpoint?: HTMLElement;
  lockGlyph?: HTMLElement;
  attrib?: HTMLElement;
  friction?: HTMLElement;
  frictionBar?: HTMLElement;
  depthCursor?: HTMLElement;
}

/**
 * Builds and updates the canvas DOM from the page fixture + viewport state.
 * Text stays real DOM text throughout — spec-ui/README + PHASE-01 §4
 * accessibility: verse text is never canvas-rasterized.
 */
export class CanvasView {
  readonly root: HTMLElement;
  readonly lanesEl: HTMLElement;
  readonly railLeft: HTMLElement;
  readonly railRight: HTMLElement;
  readonly breathFill: HTMLElement;
  readonly page: HTMLElement;
  readonly starfield: HTMLElement;

  lanes = new Map<number, LaneEls>();
  gutters = new Map<number, GutterEls>(); // keyed by lower lane number (gutter i is between lane i and i+1)
  railLeftCells = new Map<number, RailCellEls>();
  railRightCells = new Map<number, RailCellEls>();

  constructor(private mount: HTMLElement, private store: Store) {
    this.root = el("div", "viewport");
    this.starfield = el("div", "starfield");
    this.starfield.setAttribute("aria-hidden", "true");
    const rasmBg = el("div", "viewport-rasm-bg");
    rasmBg.setAttribute("aria-hidden", "true");

    this.page = el("main", "page", { "data-hud": "rest", "aria-label": "الصفحة ذات الخمسة عشر سطرًا" });
    this.railLeft = el("div", "rail rail--left", { "aria-label": "المسطرة اليسرى: الموقع والصلابة والزمن" });
    this.railRight = el("div", "rail rail--right", { "aria-label": "المسطرة اليمنى: الروابط والاحتكاك والعمق" });
    this.lanesEl = el("div", "lanes");

    this.page.append(this.railLeft, this.lanesEl, this.railRight);

    this.breathFill = el("div", "breath__fill");
    const breath = el("div", "breath", { "aria-hidden": "true" });
    breath.appendChild(this.breathFill);

    this.root.append(this.starfield, rasmBg, this.page, breath);
    this.mount.appendChild(this.root);

    this.buildLanesAndGutters();
    this.buildRailCells();
  }

  private buildLanesAndGutters(): void {
    const fixtures = this.store.page.lanes;
    fixtures.forEach((fx, idx) => {
      const laneEl = el("div", "lane", {
        "data-lane": String(fx.lane),
        "data-sura": String(fx.surah),
        "data-ayah": String(fx.ayah),
        role: "group",
        "aria-label": `السطر ${fx.lane}: ${fx.surahName} ${fx.ayah}`,
        tabindex: "0",
      });
      const seam = el("div", "lane__seam", { "aria-hidden": "true", role: "button", "aria-label": "دمج السطر المشقوق" });
      const stack = el("div", "lane__text-stack");
      const marked = el("p", "lane__text lane__text--marked");
      marked.dir = "rtl";
      const skeleton = el("p", "lane__text lane__text--skeleton");
      skeleton.dir = "rtl";
      skeleton.setAttribute("aria-hidden", "true");

      const markedWords = renderWordSpans(fx.words, "marked");
      const skeletonWords = renderWordSpans(fx.words, "skeleton");
      markedWords.forEach((w, i) => { marked.appendChild(w); if (i < markedWords.length - 1) marked.appendChild(document.createTextNode(" ")); });
      skeletonWords.forEach((w, i) => { skeleton.appendChild(w); if (i < skeletonWords.length - 1) skeleton.appendChild(document.createTextNode(" ")); });

      stack.append(marked, skeleton);
      const rings = el("div", "lane__rings");
      rings.setAttribute("aria-hidden", "true");
      for (let r = 0; r < 3; r++) rings.appendChild(el("div", "lane__ring"));

      // F01/F14 row split: before/after voice sub-rows, populated at build
      // time by splitting the āyah's words at their midpoint. No pivot-word
      // detection exists in the fixture (see data/SOURCES.md); the midpoint
      // is a documented visual approximation of "before/after this voice
      // ignited", not a claim about where the ignition word actually falls.
      const mid = Math.ceil(fx.words.length / 2);
      const before = el("p", "lane__subrow lane__subrow--before", { hidden: "" });
      const after = el("p", "lane__subrow lane__subrow--after", { hidden: "" });
      before.dir = "rtl"; after.dir = "rtl";
      before.textContent = fx.words.slice(0, mid).map((w) => w.marked).join(" ");
      after.textContent = fx.words.slice(mid).map((w) => w.marked).join(" ");

      laneEl.append(seam, stack, before, after, rings);
      this.lanesEl.appendChild(laneEl);
      this.lanes.set(fx.lane, { root: laneEl, seam, textStack: stack, marked, skeleton, rings, before, after });

      if (idx < fixtures.length - 1) {
        const gEl = el("div", "gutter", { "data-gutter": String(fx.lane), role: "button", "aria-label": `الفجوة بين السطرين ${fx.lane} و${fx.lane + 1}` });
        gEl.appendChild(el("div", "gutter__filaments"));
        gEl.appendChild(el("div", "gutter__skeleton"));
        gEl.appendChild(el("div", "gutter__strands"));
        gEl.appendChild(el("div", "gutter__ghosts"));
        const depthLabel = el("div", "gutter__depth-label");
        gEl.appendChild(depthLabel);
        this.lanesEl.appendChild(gEl);
        this.gutters.set(fx.lane, { root: gEl, depthLabel });
      }
    });
  }

  private buildRailCells(): void {
    const fixtures = this.store.page.lanes;
    for (const fx of fixtures) {
      this.railLeft.appendChild(this.buildLeftCell(fx));
      this.railRight.appendChild(this.buildRightCell(fx));
    }
  }

  private buildLeftCell(fx: LaneFixture): HTMLElement {
    const cell = el("div", "rail__cell", { "data-lane": String(fx.lane), role: "img", "aria-label": `مؤشرات السطر ${fx.lane}` });
    const ticker = el("div", "ticker");
    const track = el("div", "ticker__track");
    const marker = el("div", "ticker__marker");
    ticker.append(track, marker);

    const rigidity = el("div", "rigidity");
    const ticks: HTMLElement[] = [];
    for (let i = 0; i < 5; i++) {
      const t = el("div", "rigidity__tick");
      rigidity.appendChild(t);
      ticks.push(t);
    }

    const checkpoint = el("div", "checkpoint", { "aria-hidden": "true" });
    const lockGlyph = el("div", "lock-glyph", { "aria-hidden": "true" });
    lockGlyph.textContent = "🔒";
    lockGlyph.style.fontSize = "8px";

    cell.append(ticker, rigidity, checkpoint, lockGlyph);
    this.railLeftCells.set(fx.lane, { root: cell, ticker, tickerMarker: marker, rigidityTicks: ticks, checkpoint, lockGlyph });
    return cell;
  }

  private buildRightCell(fx: LaneFixture): HTMLElement {
    const cell = el("div", "rail__cell", { "data-lane": String(fx.lane), role: "img", "aria-label": `روابط واحتكاك السطر ${fx.lane}` });
    const attrib = el("div", "attrib");
    const friction = el("div", "friction");
    const bar = el("div", "friction__bar");
    friction.appendChild(bar);
    const cursor = el("div", "depth-cursor");
    cell.append(attrib, friction, cursor);
    this.railRightCells.set(fx.lane, { root: cell, attrib, friction, frictionBar: bar, depthCursor: cursor });
    return cell;
  }

  // -- render pass: governor + typography + HUD -----------------------------

  render(state: ViewportState): void {
    this.page.dataset.hud = state.hud;
    this.page.dataset.orbit = state.orbit.active ? "1" : "0";
    this.page.dataset.rasm = state.rasm.active ? "1" : "0";
    this.page.dataset.lock = state.lock.active ? "1" : "0";
    this.root.dataset.rasm = state.rasm.active ? "1" : "0";

    const fixtures = this.store.page.lanes;
    const splitLanes = new Set(state.splitLanes);

    // Set visibility ahead of measurement: a lane's true natural height
    // depends on which layer (single flow, or split before/after) is
    // actually showing, and text-wrap height can only be read post-layout.
    for (const fx of fixtures) {
      const laneEls = this.lanes.get(fx.lane)!;
      const isSplit = splitLanes.has(fx.lane);
      laneEls.textStack.hidden = isSplit;
      laneEls.before.hidden = !isSplit;
      laneEls.after.hidden = !isSplit;
    }

    const NATURAL_PAD = 14; // vertical breathing room beyond the raw text-line box
    const govInputs = fixtures.map((fx) => {
      const laneEls = this.lanes.get(fx.lane)!;
      const isSplit = splitLanes.has(fx.lane);
      const natural = isSplit
        ? laneEls.before.getBoundingClientRect().height + laneEls.after.getBoundingClientRect().height + NATURAL_PAD * 1.6
        : laneEls.marked.getBoundingClientRect().height + NATURAL_PAD;
      return {
        lane: fx.lane,
        intensity: fx.state.intensity,
        splitBoost: isSplit ? LANE_SPLIT_H - LANE_BASE_H : 0,
        naturalMinHeight: natural,
      };
    });
    const { lanes: govOut, breathClaimed } = runGovernor(govInputs);
    this.breathFill.style.width = `${Math.round(breathClaimed * 100)}%`;

    const maxFriction = Math.max(0.001, ...fixtures.map((f) => f.state.friction));

    govOut.forEach((g) => {
      const fx = fixtures.find((f) => f.lane === g.lane)!;
      const laneEls = this.lanes.get(g.lane)!;
      const isFocused = state.focusedLane === g.lane;
      const isSplit = splitLanes.has(g.lane);
      const isIsolated = state.isolatedLane !== null;
      const isIsolatedThis = state.isolatedLane === g.lane;

      laneEls.root.style.setProperty("--lane-h", `${g.height}px`);
      laneEls.root.style.setProperty("--lv-intensity", String(fx.state.intensity));
      laneEls.root.style.setProperty("--lv-friction", String(fx.state.friction));
      laneEls.root.style.setProperty("--lv-depth", String(fx.state.depth));
      laneEls.root.style.setProperty("--lv-axis-delta", String(fx.state.axis.address - fx.state.axis.absent));
      laneEls.root.dataset.focused = isFocused ? "1" : "0";
      laneEls.root.dataset.split = isSplit ? "1" : "0";
      const fixtureLensOn = fx.state.lens && state.activeLenses.includes(fx.state.lens) ? fx.state.lens : null;
      const computedLensOn = (Object.entries(state.computedLensTargets) as [string, number[]][])
        .find(([, lanes]) => lanes.includes(g.lane))?.[0] ?? null;
      laneEls.root.dataset.lensActive = fixtureLensOn ?? computedLensOn ?? "";
      laneEls.root.dataset.warm = isFocused && fx.state.axis.address > fx.state.axis.absent ? "1" : "0";
      laneEls.root.dataset.cool = isIsolated && !isIsolatedThis ? "1" : "0";

      // F14 depth-of-field compression: neighbors of a split (shifting) lane soften
      const nearSplit = [...splitLanes].some((s) => Math.abs(s - g.lane) === 1);
      laneEls.root.style.setProperty("--lane-defocus", nearSplit ? "1" : "0");

      const rasmEpicenter = state.rasm.active ? state.focusedLane ?? 8 : 0;
      const dist = Math.abs(g.lane - (rasmEpicenter || g.lane));
      laneEls.root.style.setProperty("--rasm-delay", `${dist * 28}ms`);

      // F01 ignited span: mark قول-root words when the rupture lens is live for this lane
      const showIgnite = fx.state.lens === "F01" && state.activeLenses.includes("F01");
      laneEls.marked.querySelectorAll<HTMLElement>(".word").forEach((wordEl) => {
        const wIndex = Number(wordEl.dataset.word);
        const wf = fx.words.find((w) => w.i === wIndex);
        wordEl.dataset.ignited = showIgnite && wf?.root === "قول" ? "1" : "0";
      });

      // F06 passivity: dim lanes with no finite verb when the lens is active
      const passivityOn = fx.state.lens === "F06" && state.activeLenses.includes("F06");
      laneEls.marked.querySelectorAll<HTMLElement>(".word").forEach((wordEl) => {
        wordEl.dataset.passive = passivityOn ? "1" : "0";
      });
    });

    this.renderRails(fixtures, state, maxFriction);
  }

  private renderRails(fixtures: LaneFixture[], state: ViewportState, maxFriction: number): void {
    for (const fx of fixtures) {
      const left = this.railLeftCells.get(fx.lane)!;
      const right = this.railRightCells.get(fx.lane)!;
      const isFocused = state.focusedLane === fx.lane;

      left.root.dataset.focused = isFocused ? "1" : "0";
      right.root.dataset.focused = isFocused ? "1" : "0";

      // proximity ticker (F13): position marker along address(-)/absent(+) span
      const pct = 50 - (fx.state.axis.address - fx.state.axis.absent) * 45;
      left.tickerMarker!.style.left = `calc(${pct}% - 3px)`;

      // rigidity rail (F12): quintile of (1 - friction) as a rigidity proxy —
      // a calm, unshifting lane reads as structurally rigid in this fixture.
      const rigidity = 1 - fx.state.friction;
      const band = Math.min(4, Math.floor(rigidity * 5));
      left.rigidityTicks!.forEach((t, i) => { t.dataset.on = i <= band ? "1" : "0"; });

      // timeline checkpoints
      const native = this.store.page.checkpoints.find((c) => c.lane === fx.lane);
      const authored = state.authoredCheckpoints.find((c) => c.lane === fx.lane);
      const cp = authored ?? native;
      if (cp) {
        left.checkpoint!.style.visibility = "visible";
        left.checkpoint!.dataset.depth = cp.depth;
        left.checkpoint!.dataset.authored = authored ? "1" : "0";
        const distToFocus = state.focusedLane !== null ? fx.lane - state.focusedLane : 99;
        left.checkpoint!.dataset.glow = cp.depth === "deep" && distToFocus <= 2 && distToFocus > 0 ? "1" : "0";
      } else {
        left.checkpoint!.style.visibility = "hidden";
      }
      left.lockGlyph!.parentElement!.dataset.locked = state.lock.active && state.lock.boundaryLane === fx.lane ? "1" : "0";

      // attribution glyphs: one per repeated root touching this lane
      right.attrib!.innerHTML = "";
      for (const [root, laneList] of Object.entries(this.store.page.roots)) {
        if (laneList.includes(fx.lane)) {
          const g = el("span", "attrib__glyph");
          g.textContent = root[0];
          g.title = root;
          right.attrib!.appendChild(g);
        }
      }

      // friction meter (F10)
      const pctFriction = Math.round((fx.state.friction / maxFriction) * 100);
      right.frictionBar!.style.width = `${pctFriction}%`;
      right.frictionBar!.dataset.hot = fx.state.friction === maxFriction && maxFriction > 0 ? "1" : "0";

      // depth cursor (F18)
      right.depthCursor!.parentElement!.dataset.cursor = state.isolatedLane === fx.lane ? "1" : "0";
    }
  }
}
