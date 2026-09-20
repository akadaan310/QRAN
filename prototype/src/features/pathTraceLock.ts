import type { Store } from "../store/state";
import type { CanvasView } from "../canvas/render";

const RECOVERY_STEPS = 3; // lanes the reader must walk back to recover the anchor

/**
 * F16 — Temporal De-synchronization (Inverse Path-Trace Lock). spec-ui/02
 * §F16, product-spec/03 §Boundary contact / Reverse-drag, US-3.1/3.2/3.3.
 * "Deep" native/authored checkpoints are the boundary source (see
 * data/SOURCES.md for how those are derived in this fixture).
 */
export class PathTraceLockController {
  private resolvedLanes = new Set<number>();
  private stepsBack = 0;
  onToast: ((message: string, kind?: "refuse") => void) | null = null;
  onRelease: (() => void) | null = null;
  onEncounter: (() => void) | null = null;

  constructor(private store: Store, private canvas: CanvasView) {}

  private deepCheckpointAt(lane: number): boolean {
    const s = this.store.get();
    const native = this.store.page.checkpoints.find((c) => c.lane === lane && c.depth === "deep");
    const authored = s.authoredCheckpoints.find((c) => c.lane === lane && c.depth === "deep");
    return Boolean(native || authored);
  }

  /**
   * Gate for any forward focus change. Returns true if the move is allowed.
   * Call this instead of setting `focusedLane` directly whenever the move
   * originates from a forward gesture (tap-lane, swipe-forward).
   */
  guardForwardFocus(fromLane: number | null, toLane: number): boolean {
    const s = this.store.get();
    if (s.lock.active) {
      this.onToast?.("مُقفَل — الرجوع هو الطريق الوحيد الآن", "refuse");
      return false;
    }
    if (fromLane !== null && toLane > fromLane && this.deepCheckpointAt(toLane) && !this.resolvedLanes.has(toLane)) {
      this.engage(toLane);
      return false; // the contact itself is the detent; focus does not advance this gesture
    }
    return true;
  }

  private engage(boundaryLane: number): void {
    this.store.update({ lock: { active: true, boundaryLane, recoveredUpTo: boundaryLane } });
    this.stepsBack = 0;
    this.markAhead(boundaryLane);
    this.onEncounter?.();
    this.onToast?.("حدّ زمني عميق — تراجَع لتُزامِن");
  }

  private markAhead(boundaryLane: number): void {
    this.canvas.lanesEl.dataset.lockDir = "forward";
    for (const [lane, { root }] of this.canvas.lanes) {
      root.dataset.ahead = lane >= boundaryLane ? "1" : "0";
    }
  }

  private clearAhead(): void {
    for (const { root } of this.canvas.lanes.values()) root.dataset.ahead = "0";
    delete this.canvas.lanesEl.dataset.lockDir;
  }

  /** Call when the reader taps/drags to a lane strictly behind the current recovery point while locked. */
  attemptReverseStep(toLane: number): void {
    const s = this.store.get();
    if (!s.lock.active || s.lock.recoveredUpTo === null) return;
    if (toLane >= s.lock.recoveredUpTo) {
      this.onToast?.("مُقفَل — الرجوع هو الطريق الوحيد الآن", "refuse");
      return; // not a backward step
    }

    this.ghostGutter(toLane);
    this.stepsBack += 1;
    this.store.update({ lock: { ...s.lock, recoveredUpTo: toLane } });

    if (this.stepsBack >= RECOVERY_STEPS) {
      this.recover(s.lock.boundaryLane!);
    }
  }

  private ghostGutter(lane: number): void {
    const g = this.canvas.gutters.get(Math.max(1, lane));
    if (!g) return;
    g.root.dataset.rollback = "1";
    window.setTimeout(() => { g.root.dataset.rollback = "0"; }, 550);
  }

  private recover(boundaryLane: number): void {
    this.resolvedLanes.add(boundaryLane);
    this.clearAhead();
    this.store.update({ lock: { active: false, boundaryLane: null, recoveredUpTo: null }, focusedLane: this.store.get().lock.recoveredUpTo });
    this.onRelease?.();
    this.onToast?.("تحرَّر القفل — استُعيدَ المرساة");
  }

  get isActive(): boolean {
    return this.store.get().lock.active;
  }
}
