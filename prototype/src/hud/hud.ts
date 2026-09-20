import type { Store } from "../store/state";
import type { HudState } from "../store/types";

/**
 * The six-state HUD machine — spec-ui/04, product-spec/04 §The six HUD
 * states. Priority order when multiple conditions hold at once: Locked >
 * Rasm > Orbit > Lens > Tracking > Rest (a lock or the contemplative rasm
 * state always wins the rail's attention over a merely-active lens).
 */
const REST_DELAY_MS = 2600;

export class HudController {
  private restTimer: number | null = null;

  constructor(private store: Store) {
    store.subscribe(() => this.recompute());
    this.armRestTimer();
  }

  private armRestTimer(): void {
    if (this.restTimer !== null) window.clearTimeout(this.restTimer);
    this.restTimer = window.setTimeout(() => {
      const s = this.store.get();
      if (s.hud === "tracking") this.store.setHud("rest");
    }, REST_DELAY_MS);
  }

  /** Call on any touch/interaction to keep the rail out of Rest state. */
  noteActivity(): void {
    const s = this.store.get();
    if (s.hud === "rest") this.store.setHud("tracking");
    this.armRestTimer();
  }

  private recompute(): void {
    const s = this.store.get();
    let next: HudState;
    if (s.lock.active) next = "locked";
    else if (s.rasm.active) next = "rasm";
    else if (s.orbit.active) next = "orbit";
    else if (s.gutterSpeed > 0) next = "lens";
    else if (s.hud === "rest") next = "rest";
    else next = "tracking";

    if (next !== s.hud) {
      this.store.update({ hud: next });
    }
  }
}
