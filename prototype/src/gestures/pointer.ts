/**
 * Small Pointer Events primitives shared by the gesture dictionary.
 * Pointer Events throughout (no mouse-only or touch-only paths) —
 * BUILD_PROMPT §3 "Touch-first".
 */

export function isDoubleTap(prevTapAt: number, prevX: number, prevY: number, x: number, y: number, now: number): boolean {
  return now - prevTapAt < 320 && Math.hypot(x - prevX, y - prevY) < 28;
}

export type PressSpeed = 0 | 1 | 2 | 3;

/**
 * Escalates a sustained press through three speeds. Uses PointerEvent
 * pressure when the digitizer reports real analog force (values other than
 * the flat 0/0.5/1 a non-pressure-sensitive touchscreen reports); falls
 * back to dwell time otherwise — "press-pressure via touch force where
 * available with dwell-time fallback" (BUILD_PROMPT §3).
 */
export class PressEscalator {
  private startedAt = 0;
  private raf = 0;
  private sawVariablePressure = false;
  private maxPressure = 0;
  speed: PressSpeed = 0;

  constructor(private onSpeed: (speed: PressSpeed) => void, private onRelease: () => void) {}

  start(initialPressure: number): void {
    this.startedAt = performance.now();
    this.speed = 0;
    this.sawVariablePressure = false;
    this.maxPressure = initialPressure;
    this.tick();
  }

  feedPressure(p: number): void {
    if (p > 0 && p !== 0.5 && p !== 1) this.sawVariablePressure = true;
    this.maxPressure = Math.max(this.maxPressure, p);
  }

  private tick = (): void => {
    const elapsed = performance.now() - this.startedAt;
    let next: PressSpeed;
    if (this.sawVariablePressure) {
      next = this.maxPressure > 0.85 ? 3 : this.maxPressure > 0.6 ? 2 : this.maxPressure > 0.25 ? 1 : 0;
    } else {
      next = elapsed > 900 ? 3 : elapsed > 450 ? 2 : elapsed > 140 ? 1 : 0;
    }
    if (next !== this.speed) {
      this.speed = next;
      this.onSpeed(next);
    }
    this.raf = requestAnimationFrame(this.tick);
  };

  release(): void {
    cancelAnimationFrame(this.raf);
    this.speed = 0;
    this.onRelease();
  }
}

export interface ActivePointer { id: number; x: number; y: number; }

/** Tracks 2+ active pointers to derive pinch distance and inward/outward direction. */
export class PinchTracker {
  private pointers = new Map<number, ActivePointer>();
  private startDist = 0;
  active = false;

  add(id: number, x: number, y: number): void {
    this.pointers.set(id, { id, x, y });
    if (this.pointers.size === 2) {
      this.startDist = this.distance();
      this.active = true;
    }
  }

  move(id: number, x: number, y: number): number | null {
    if (!this.pointers.has(id)) return null;
    this.pointers.set(id, { id, x, y });
    if (this.pointers.size < 2) return null;
    const d = this.distance();
    return this.startDist > 0 ? d / this.startDist : 1; // <1 = pinched inward, >1 = spread outward
  }

  remove(id: number): void {
    this.pointers.delete(id);
    if (this.pointers.size < 2) this.active = false;
  }

  epicenter(): { x: number; y: number } {
    const pts = [...this.pointers.values()];
    const x = pts.reduce((a, p) => a + p.x, 0) / (pts.length || 1);
    const y = pts.reduce((a, p) => a + p.y, 0) / (pts.length || 1);
    return { x, y };
  }

  private distance(): number {
    const pts = [...this.pointers.values()];
    if (pts.length < 2) return 0;
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
  }

  get count(): number { return this.pointers.size; }
}
