import type { Store } from "../store/state";
import type { CanvasView } from "../canvas/render";
import type { HudController } from "../hud/hud";
import type { ToastRail } from "../hud/toast";
import type { GutterLensController } from "../features/gutterLens";
import type { EchoTrajectoryController } from "../features/echoTrajectory";
import type { PathTraceLockController } from "../features/pathTraceLock";
import type { AuditController } from "../features/audit";
import type { Persistence } from "../store/persistence";
import { isDoubleTap, PinchTracker, PressEscalator, type PressSpeed } from "./pointer";

const CHECKPOINT_AUTHOR_HOLD_MS = 480;

const TAP_MOVE_TOLERANCE = 10;
const RAIL_DENSITIES: Array<"spine" | "expanded" | "full"> = ["spine", "expanded", "full"];

/**
 * The 18-gesture dictionary — product-spec/03 §Gesture dictionary. Every
 * gesture is reversible; every mode names its dismissal (implemented as a
 * companion handler alongside its trigger, not bolted on separately).
 */
export class GestureController {
  private pressStart = new Map<number, { x: number; y: number; t: number; target: Element }>();
  private gutterEscalators = new Map<string, PressEscalator>();
  private railPinch = new PinchTracker();
  private lanesPinch = new PinchTracker();
  private railTapCandidates: number[] = [];
  private lastWordTap = { at: 0, x: 0, y: 0, lane: 0, word: 0 };
  private wordTapTimer: number | null = null;
  /** Set by the hosting screen to open a word card (§7.2). */
  onWordTap: ((lane: number, wordIndex: number, root: string | null) => void) | null = null;
  private lockDragLastLane: number | null = null;
  private orbitDragLastX: number | null = null;
  private orbitDragPointerId: number | null = null;
  /** document/window-level listeners need explicit teardown when a screen
   * unmounts (canvas.root's own children are cleaned up for free when the
   * router clears the container) — see destroy(). */
  private globalDisposers: (() => void)[] = [];

  constructor(
    private store: Store,
    private canvas: CanvasView,
    private hud: HudController,
    private toast: ToastRail,
    private gutterLens: GutterLensController,
    private echo: EchoTrajectoryController,
    private lock: PathTraceLockController,
    private audit: AuditController,
    private persistence: Persistence,
  ) {
    this.lock.onToast = (msg, kind) => this.toast.show(msg, kind);
    this.wireLanes();
    this.wireGutters();
    this.wireRails();
    this.wireLanesPinch();
    this.wireKeyboard();
    this.wireScrollLock();
  }

  // -- 1. Tap lane -> focus; dismiss: tap elsewhere / keyboard fallback ------
  // -- 2. Tap seam -> merge split row ----------------------------------------
  // -- 6. Double-tap word -> echo-trajectory; dismiss: outward fling / double-tap hub
  private wireLanes(): void {
    this.canvas.lanesEl.addEventListener("pointerdown", (e) => {
      this.hud.noteActivity();
      const target = e.target as Element;
      this.pressStart.set(e.pointerId, { x: e.clientX, y: e.clientY, t: performance.now(), target });

      if (this.echo.isActive && this.orbitDragPointerId === null && target.closest(".lane") && !target.closest(".beacon")) {
        this.orbitDragPointerId = e.pointerId;
        this.orbitDragLastX = e.clientX;
      }
    });

    this.canvas.lanesEl.addEventListener("pointermove", (e) => {
      if (this.orbitDragPointerId === e.pointerId && this.orbitDragLastX !== null) {
        const delta = e.clientX - this.orbitDragLastX;
        this.orbitDragLastX = e.clientX;
        this.echo.rotate(delta * 0.6); // -- 7. Drag in orbit mode -> rotate --
        return;
      }
      if (this.lock.isActive) this.trackReverseDrag(e);
    });

    this.canvas.lanesEl.addEventListener("pointerup", (e) => {
      if (this.orbitDragPointerId === e.pointerId) {
        this.orbitDragPointerId = null;
        this.orbitDragLastX = null;
      }
      const start = this.pressStart.get(e.pointerId);
      this.pressStart.delete(e.pointerId);
      this.lockDragLastLane = null;
      if (!start) return;
      const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
      if (moved > TAP_MOVE_TOLERANCE) return; // was a drag, not a tap

      const target = e.target as Element;
      const seam = target.closest(".lane__seam");
      if (seam) { this.mergeSplit(Number(seam.closest(".lane")!.getAttribute("data-lane"))); return; }

      const wordEl = target.closest<HTMLElement>(".word");
      const laneEl = target.closest<HTMLElement>(".lane");
      if (!laneEl) return;
      const lane = Number(laneEl.dataset.lane);

      if (wordEl && !this.store.get().rasm.active) {
        const wIndex = Number(wordEl.dataset.word);
        const root = wordEl.dataset.root ?? null;
        const now = performance.now();
        if (isDoubleTap(this.lastWordTap.at, this.lastWordTap.x, this.lastWordTap.y, e.clientX, e.clientY, now) && this.lastWordTap.lane === lane && this.lastWordTap.word === wIndex) {
          if (this.wordTapTimer !== null) { window.clearTimeout(this.wordTapTimer); this.wordTapTimer = null; }
          this.onWordDoubleTap(lane, wIndex, root);
          this.lastWordTap = { at: 0, x: 0, y: 0, lane: 0, word: 0 };
          return;
        }
        this.lastWordTap = { at: now, x: e.clientX, y: e.clientY, lane, word: wIndex };
        // §7.2: a plain single tap on a word opens its lexicon card — but
        // only once the double-tap window has closed, so it never races
        // the echo-trajectory double-tap above.
        if (this.wordTapTimer !== null) window.clearTimeout(this.wordTapTimer);
        this.wordTapTimer = window.setTimeout(() => {
          this.wordTapTimer = null;
          this.onWordTap?.(lane, wIndex, root);
        }, 300);
      }

      if (this.echo.isActive) { this.tryFlingDismiss(laneEl); return; }
      this.setFocus(lane);
    });
  }

  private onWordDoubleTap(lane: number, wordIndex: number, root: string | null): void {
    const s = this.store.get();
    if (s.orbit.active && s.orbit.hubLane === lane && s.orbit.hubWordIndex === wordIndex) {
      this.echo.dismiss(); // double-tap hub again dismisses
      return;
    }
    if (!root || !this.store.page.roots[root]) {
      this.toast.show("لا صدى لهذه الكلمة على هذه الصفحة");
      return;
    }
    this.echo.start(lane, wordIndex, root);
  }

  private tryFlingDismiss(laneEl: HTMLElement): void {
    // an outward fling from the hub: a tap far from the hub's lane counts as
    // the discoverable dismissal fallback for readers who can't fling.
    const hub = this.echo.hubLane;
    const lane = Number(laneEl.dataset.lane);
    if (hub !== null && Math.abs(lane - hub) >= 3) this.echo.dismiss();
  }

  private mergeSplit(lane: number): void {
    const s = this.store.get();
    this.store.update({ splitLanes: s.splitLanes.filter((l) => l !== lane) });
  }

  setFocus(lane: number, opts: { fromReverse?: boolean } = {}): void {
    const s = this.store.get();
    if (s.lock.active && !opts.fromReverse) {
      // while locked, a discrete tap is the tap-fallback for the reverse
      // drag: a lane behind the recovery point counts as one backward
      // step, anything else is refused (motor fallback for press-and-hold
      // gestures — PHASE-01-UI-SYSTEM §3).
      this.lock.attemptReverseStep(lane);
      return;
    }
    if (!opts.fromReverse) {
      const allowed = this.lock.guardForwardFocus(s.focusedLane, lane);
      if (!allowed) return;
    }
    const fx = this.store.laneById(lane);
    const splitWorthy = fx?.state.lens === "F01" || fx?.state.lens === "F04";
    const split = new Set(s.splitLanes);
    if (splitWorthy) split.add(lane); else split.delete(lane);
    this.store.update({ focusedLane: lane, splitLanes: [...split] });
    this.hud.noteActivity();
  }

  // -- 3/4/5. Gutter press: light / firm / deep; release reverses -----------
  private wireGutters(): void {
    for (const [laneNo, g] of this.canvas.gutters) {
      const key = String(laneNo);
      g.root.addEventListener("pointerdown", (e) => {
        this.hud.noteActivity();
        e.preventDefault();
        const esc = new PressEscalator(
          (speed: PressSpeed) => this.gutterLens.setSpeed(laneNo, speed),
          () => this.gutterLens.setSpeed(laneNo, 0),
        );
        esc.start(e.pressure || 0);
        this.gutterEscalators.set(key, esc);
      });
      g.root.addEventListener("pointermove", (e) => {
        this.gutterEscalators.get(key)?.feedPressure(e.pressure || 0);
      });
      const release = () => { this.gutterEscalators.get(key)?.release(); this.gutterEscalators.delete(key); };
      g.root.addEventListener("pointerup", release);
      g.root.addEventListener("pointercancel", release);
      g.root.addEventListener("pointerleave", release);
    }
  }

  // -- 12. Multi-finger pinch inward (rasm); pinch on lanes area -----------
  private wireLanesPinch(): void {
    const area = this.canvas.lanesEl;
    area.addEventListener("pointerdown", (e) => {
      if (e.target instanceof Element && e.target.closest(".rail")) return;
      this.lanesPinch.add(e.pointerId, e.clientX, e.clientY);
    });
    area.addEventListener("pointermove", (e) => {
      const ratio = this.lanesPinch.move(e.pointerId, e.clientX, e.clientY);
      if (ratio === null) return;
      const s = this.store.get();
      if (ratio < 0.72 && !s.rasm.active) {
        const epi = this.lanesPinch.epicenter();
        const laneEl = document.elementFromPoint(epi.x, epi.y)?.closest<HTMLElement>(".lane");
        const epicenterLane = laneEl ? Number(laneEl.dataset.lane) : s.focusedLane ?? 8;
        this.store.update({ rasm: { active: true }, focusedLane: epicenterLane });
        this.hud.noteActivity();
      } else if (ratio > 1.25 && s.rasm.active) {
        this.store.update({ rasm: { active: false } });
      }
    });
    const end = (e: PointerEvent) => this.lanesPinch.remove(e.pointerId);
    area.addEventListener("pointerup", end);
    area.addEventListener("pointercancel", end);
  }

  // -- reverse-drag while locked (11) ----------------------------------------
  private trackReverseDrag(e: PointerEvent): void {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const laneEl = el?.closest<HTMLElement>(".lane");
    if (!laneEl) return;
    const lane = Number(laneEl.dataset.lane);
    if (this.lockDragLastLane === lane) return;
    this.lockDragLastLane = lane;
    this.lock.attemptReverseStep(lane);
  }

  // -- rail gestures: 13 scrub, 14 tap cell, 15 tap friction bar, 16 pinch
  //    margin density, 17 long-press checkpoint, 18 two-finger tap rail ----
  private wireRails(): void {
    for (const railEl of [this.canvas.railLeft, this.canvas.railRight]) {
      let scrubbing = false;
      let authorTimer: number | null = null;
      const isTimelineRail = railEl === this.canvas.railLeft;

      railEl.addEventListener("pointerdown", (e) => {
        this.hud.noteActivity();
        this.railPinch.add(e.pointerId, e.clientX, e.clientY);
        this.railTapCandidates.push(e.pointerId);
        scrubbing = true;

        const cpEl = (e.target as Element).closest<HTMLElement>(".checkpoint");
        const cell = (e.target as Element).closest<HTMLElement>(".rail__cell");
        const laneHasCheckpoint = cell ? this.checkpointAt(Number(cell.dataset.lane)) !== null : false;
        if (cpEl && laneHasCheckpoint) {
          window.setTimeout(() => this.previewCheckpoint(cpEl), 0);
        } else if (isTimelineRail && cell) {
          // US-4.3: a long-press on an *empty* stretch of the timeline
          // rail authors a new checkpoint there (17's companion — a
          // long-press on an *existing* one previews it instead).
          authorTimer = window.setTimeout(() => this.authorCheckpoint(Number(cell.dataset.lane)), CHECKPOINT_AUTHOR_HOLD_MS);
        }
      });

      railEl.addEventListener("pointermove", (e) => {
        const ratio = this.railPinch.move(e.pointerId, e.clientX, e.clientY);
        if (ratio !== null && this.railPinch.count >= 2) {
          if (ratio < 0.8 || ratio > 1.2) {
            this.railTapCandidates = []; // movement disqualifies the two-finger-tap reading
            this.cycleDensity();
            this.railPinch.remove(e.pointerId); // consume — avoid re-triggering every frame
          }
          if (authorTimer !== null) { window.clearTimeout(authorTimer); authorTimer = null; }
          return;
        }
        if (scrubbing && this.railPinch.count < 2) this.scrubCursor(railEl, e.clientY);
      });

      const up = (e: PointerEvent) => {
        scrubbing = false;
        this.railPinch.remove(e.pointerId);
        if (authorTimer !== null) { window.clearTimeout(authorTimer); authorTimer = null; }
        const idx = this.railTapCandidates.indexOf(e.pointerId);
        if (idx >= 0) this.railTapCandidates.splice(idx, 1);

        const target = e.target as Element;
        const cell = target.closest<HTMLElement>(".rail__cell");
        if (!cell) return;
        const lane = Number(cell.dataset.lane);
        if (target.closest(".friction")) { this.isolateAndAudit(lane); return; }
        if (target.closest(".checkpoint")) return; // handled on down (preview)
        this.toggleIsolate(lane);
      };
      railEl.addEventListener("pointerup", up);
    }

    // two-finger tap detection across both rails combined (18)
    const twoFingerTap = (e: PointerEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest(".rail")) return;
      if (this.railTapStreak()) this.togglePassivityGlobal();
    };
    document.addEventListener("pointerdown", twoFingerTap);
    this.globalDisposers.push(() => document.removeEventListener("pointerdown", twoFingerTap));
  }

  private tapStreak: number[] = [];
  private railTapStreak(): boolean {
    const now = performance.now();
    this.tapStreak = this.tapStreak.filter((t) => now - t < 180);
    this.tapStreak.push(now);
    return this.tapStreak.length >= 2;
  }

  private togglePassivityGlobal(): void {
    this.store.toggleLens("F06");
    this.toast.show(this.store.get().activeLenses.includes("F06") ? "عدسة السكون: مُفعَّلة" : "عدسة السكون: مُعطَّلة");
  }

  private scrubCursor(railEl: HTMLElement, clientY: number): void {
    const cells = railEl.querySelectorAll<HTMLElement>(".rail__cell");
    let closest: HTMLElement | null = null;
    let bestDist = Infinity;
    cells.forEach((c) => {
      const r = c.getBoundingClientRect();
      const d = Math.abs(clientY - (r.top + r.height / 2));
      if (d < bestDist) { bestDist = d; closest = c; }
    });
    cells.forEach((c) => c.dataset.cursor = "0");
    if (closest) (closest as HTMLElement).dataset.cursor = "1";
  }

  private toggleIsolate(lane: number): void {
    const s = this.store.get();
    this.store.update({ isolatedLane: s.isolatedLane === lane ? null : lane });
  }

  private isolateAndAudit(lane: number): void {
    this.toggleIsolate(lane);
    const fx = this.store.laneById(lane);
    if (fx) this.audit.open(fx);
  }

  private cycleDensity(): void {
    const s = this.store.get();
    const idx = RAIL_DENSITIES.indexOf(s.railDensity);
    const next = RAIL_DENSITIES[(idx + 1) % RAIL_DENSITIES.length];
    this.store.update({ railDensity: next });
    this.canvas.root.dataset.railDensity = next;
    this.toast.show(`كثافة الهامش: ${next === "spine" ? "عمود" : next === "expanded" ? "موسّعة" : "كاملة"}`);
  }

  private previewCheckpoint(cpEl: HTMLElement): void {
    const cell = cpEl.closest<HTMLElement>(".rail__cell");
    if (!cell) return;
    const cp = this.checkpointAt(Number(cell.dataset.lane));
    if (cp) this.toast.show(`${cp.label} — ${cp.note}`);
  }

  private checkpointAt(lane: number) {
    const native = this.store.page.checkpoints.find((c) => c.lane === lane);
    const authored = this.store.get().authoredCheckpoints.find((c) => c.lane === lane);
    return authored ?? native ?? null;
  }

  private authorCheckpoint(lane: number): void {
    if (this.checkpointAt(lane)) return; // already claimed between press and fire
    const fx = this.store.laneById(lane);
    if (!fx) return;
    const depth: "shallow" | "deep" = fx.state.friction >= 0.4 ? "deep" : "shallow";
    const record = {
      pageId: this.store.page.id,
      lane,
      label: `مَأوى — ${fx.surahName} ${fx.ayah}`,
      note: "علامة أثبتها القارئ يدويًا على المسطرة الزمنية.",
      depth,
      authoredByTrack: this.store.get().track.mode,
    };
    this.store.update((s) => ({ authoredCheckpoints: [...s.authoredCheckpoints, record] }));
    void this.persistence.addCheckpoint(record);
    this.toast.show(`أُثبتت نقطة توقّف عند السطر ${lane}`);
    this.hud.noteActivity();
  }

  // -- scroll-driven focus + boundary contact (9, 10) ------------------------
  private wireScrollLock(): void {
    // Guard against the observer reacting to layout settling (fonts,
    // onboarding dismissal, initial mount) rather than a real reader
    // gesture: it only drives focus/lock after a genuine scroll event has
    // been seen, and only once scrolling has been still for a moment.
    let userHasScrolled = false;
    let settleTimer = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!userHasScrolled || this.lock.isActive) return;
        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => {
          const visible = entries.filter((en) => en.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible.length === 0) return;
          const laneEl = visible[0].target as HTMLElement;
          const lane = Number(laneEl.dataset.lane);
          const s = this.store.get();
          if (s.focusedLane === lane) return;
          this.setFocus(lane);
        }, 140);
      },
      { threshold: [0.6], rootMargin: "-40% 0px -40% 0px" },
    );
    for (const { root } of this.canvas.lanes.values()) observer.observe(root);
    this.globalDisposers.push(() => observer.disconnect());

    // while locked: clamp further forward scroll — the only valid gesture is reversal
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      userHasScrolled = true;
      if (this.lock.isActive) {
        const dy = window.scrollY - lastScrollY;
        if (dy > 0) window.scrollTo(0, lastScrollY); // refuse forward scroll while locked
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    this.globalDisposers.push(() => window.removeEventListener("scroll", onScroll));
  }

  // -- keyboard fallback: full keyboard navigation, PHASE-01-UI-SYSTEM §4 --
  private wireKeyboard(): void {
    const onKeydown = (e: KeyboardEvent) => {
      const s = this.store.get();
      const cur = s.focusedLane ?? 1;
      switch (e.key) {
        case "ArrowDown": e.preventDefault(); this.setFocus(Math.min(this.store.page.lanes.length, cur + 1)); break;
        case "ArrowUp": e.preventDefault(); this.setFocus(Math.max(1, cur - 1)); break;
        case "ArrowRight": e.preventDefault(); this.gutterLens.setSpeed(Math.max(1, cur), Math.min(3, (s.gutterSpeed + 1)) as PressSpeed); break;
        case "ArrowLeft": e.preventDefault(); this.gutterLens.setSpeed(Math.max(1, s.gutterIndex ?? cur), Math.max(0, (s.gutterSpeed - 1)) as PressSpeed); break;
        case " ": e.preventDefault(); this.store.update({ rasm: { active: !s.rasm.active } }); break;
        case "m": case "M": this.cycleDensity(); break;
        case "f": case "F": { const fx = this.store.laneById(cur); if (fx) this.audit.open(fx); break; }
        case "Escape": if (this.echo.isActive) this.echo.dismiss(); if (this.audit.isOpen) this.audit.close(); break;
      }
      this.hud.noteActivity();
    };
    document.addEventListener("keydown", onKeydown);
    this.globalDisposers.push(() => document.removeEventListener("keydown", onKeydown));
  }

  /** Tears down document/window-level listeners. Call when this screen
   * unmounts (e.g. router navigation away from the reader) — DOM-scoped
   * listeners under canvas.root clean themselves up when that subtree is
   * removed, but these three would otherwise silently accumulate. */
  destroy(): void {
    for (const dispose of this.globalDisposers) dispose();
    this.globalDisposers = [];
    if (this.wordTapTimer !== null) window.clearTimeout(this.wordTapTimer);
  }
}
