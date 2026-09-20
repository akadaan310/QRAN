import type { Store } from "../store/state";
import type { CanvasView } from "../canvas/render";

const NS = "http://www.w3.org/2000/svg";

function svgEl<K extends string>(tag: K): SVGElement {
  return document.createElementNS(NS, tag) as unknown as SVGElement;
}

/**
 * F15 — Non-Linear Path Planning (Echo-Trajectory). spec-ui/02 §F15,
 * product-spec/03 §Echo-trajectory orbital navigation, US-2.1/US-2.2.
 *
 * Orbit "bending into concentric arcs" is implemented as a per-lane
 * transform (translateX + rotate, amplitude scaled by distance from the
 * hub, phase-shifted by drag) rather than literal circular text layout —
 * reflowing real DOM glyphs onto a circular path is not something CSS can
 * do without per-character SVG text, which would cost the 60fps budget and
 * screen-reader-real-text requirement. Documented as a deviation in
 * docs/PHASE-01-UI-SYSTEM.md §6.
 */
export class EchoTrajectoryController {
  private overlay: SVGSVGElement;
  private beaconEls = new Map<number, HTMLElement>();
  private threadPath: SVGPathElement | null = null;
  private phase = 0; // degrees, drag-controlled

  constructor(private store: Store, private canvas: CanvasView) {
    this.overlay = svgEl("svg") as unknown as SVGSVGElement;
    this.overlay.setAttribute("class", "trajectory-overlay");
    this.canvas.lanesEl.insertBefore(this.overlay, this.canvas.lanesEl.firstChild);
    store.subscribe((s) => this.applyOrbitTransforms(s.orbit.active, s.orbit.hubLane));
  }

  private laneCenter(lane: number): { x: number; y: number } {
    const el = this.canvas.lanes.get(lane)!.root;
    const container = this.canvas.lanesEl;
    return {
      x: el.offsetLeft + el.offsetWidth / 2,
      y: el.offsetTop + el.offsetHeight / 2 - container.scrollTop,
    };
  }

  private wordCenter(lane: number, wordIndex: number): { x: number; y: number } {
    const laneEls = this.canvas.lanes.get(lane)!;
    const wordEl = laneEls.marked.querySelector<HTMLElement>(`.word[data-word="${wordIndex}"]`);
    const container = this.canvas.lanesEl;
    const laneRect = laneEls.root.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    if (!wordEl) return this.laneCenter(lane);
    const r = wordEl.getBoundingClientRect();
    return { x: r.left + r.width / 2 - contRect.left, y: laneRect.top - contRect.top + laneRect.height / 2 };
  }

  start(hubLane: number, hubWordIndex: number, root: string): void {
    const targets = (this.store.page.roots[root] ?? []).filter((l) => l !== hubLane);
    if (targets.length === 0) return;
    targets.sort((a, b) => Math.abs(a - hubLane) - Math.abs(b - hubLane));

    this.overlay.innerHTML = "";
    this.beaconEls.forEach((b) => b.remove());
    this.beaconEls.clear();

    const hub = this.wordCenter(hubLane, hubWordIndex);
    const pulse = document.createElement("div");
    pulse.className = "hub-pulse";
    pulse.style.left = `${hub.x - 7}px`;
    pulse.style.top = `${hub.y - 7}px`;
    this.canvas.lanesEl.appendChild(pulse);
    window.setTimeout(() => pulse.remove(), 800);

    this.store.update({
      orbit: { active: false, hubLane, hubWordIndex, hubRoot: root, landedLanes: [] },
    });

    targets.forEach((targetLane, idx) => {
      window.setTimeout(() => this.landTrajectory(hub, targetLane, idx === targets.length - 1), 220 + idx * 260);
    });
  }

  private landTrajectory(hub: { x: number; y: number }, targetLane: number, isLast: boolean): void {
    const target = this.laneCenter(targetLane);
    const path = svgEl("path") as unknown as SVGPathElement;
    const midX = (hub.x + target.x) / 2 + (target.y > hub.y ? 26 : -26);
    const midY = (hub.y + target.y) / 2;
    path.setAttribute("d", `M ${hub.x} ${hub.y} Q ${midX} ${midY} ${target.x} ${target.y}`);
    this.overlay.appendChild(path);
    requestAnimationFrame(() => path.setAttribute("data-drawn", "1"));

    const beacon = document.createElement("div");
    beacon.className = "beacon beacon-hit hit-44";
    beacon.style.left = `${target.x - 3}px`;
    beacon.style.top = `${target.y - 3}px`;
    beacon.setAttribute("role", "button");
    beacon.setAttribute("aria-label", `القفز إلى السطر ${targetLane}`);
    beacon.addEventListener("pointerup", () => this.jumpToBeacon(targetLane));
    this.canvas.lanesEl.appendChild(beacon);
    this.beaconEls.set(targetLane, beacon);
    window.setTimeout(() => beacon.setAttribute("data-landed", "1"), 20);

    this.store.update((s) => ({ orbit: { ...s.orbit, landedLanes: [...s.orbit.landedLanes, targetLane] } }));

    if (isLast) {
      window.setTimeout(() => this.store.update((s) => ({ orbit: { ...s.orbit, active: true } })), 300);
    }
  }

  private applyOrbitTransforms(active: boolean, hubLane: number | null): void {
    if (!active || hubLane === null) {
      for (const { root } of this.canvas.lanes.values()) root.style.transform = "";
      return;
    }
    for (const [lane, { root }] of this.canvas.lanes) {
      const delta = lane - hubLane;
      const norm = Math.max(-1, Math.min(1, delta / 14));
      const rad = (this.phase * Math.PI) / 180 + norm * Math.PI;
      const amp = Math.min(1, Math.abs(norm) * 1.4);
      const tx = Math.sin(rad) * 34 * amp;
      const rot = norm * 6 * Math.cos((this.phase * Math.PI) / 180);
      root.style.transform = `translateX(${tx.toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`;
    }
  }

  rotate(deltaDeg: number): void {
    const s = this.store.get();
    if (!s.orbit.active) return;
    this.phase = (this.phase + deltaDeg) % 360;
    this.applyOrbitTransforms(true, s.orbit.hubLane);
  }

  jumpToBeacon(lane: number): void {
    const s = this.store.get();
    if (!s.orbit.active) return;
    this.store.update({ focusedLane: lane });
    this.drawTrailToHub(lane);
  }

  private drawTrailToHub(currentLane: number): void {
    const s = this.store.get();
    if (s.orbit.hubLane === null) return;
    if (this.threadPath) this.threadPath.remove();
    const hub = this.laneCenter(s.orbit.hubLane);
    const cur = this.laneCenter(currentLane);
    const path = svgEl("path") as unknown as SVGPathElement;
    const midX = (hub.x + cur.x) / 2 + 18;
    const midY = (hub.y + cur.y) / 2;
    path.setAttribute("d", `M ${hub.x} ${hub.y} Q ${midX} ${midY} ${cur.x} ${cur.y}`);
    path.setAttribute("data-drawn", "1");
    path.style.opacity = "0.6";
    this.overlay.appendChild(path);
    this.threadPath = path;
  }

  dismiss(): void {
    this.store.update({ orbit: { active: false, hubLane: null, hubWordIndex: null, hubRoot: null, landedLanes: [] } });
    this.overlay.innerHTML = "";
    this.beaconEls.forEach((b) => b.remove());
    this.beaconEls.clear();
    this.threadPath = null;
    this.phase = 0;
    for (const { root } of this.canvas.lanes.values()) root.style.transform = "";
  }

  get isActive(): boolean {
    return this.store.get().orbit.active;
  }

  get hubLane(): number | null {
    return this.store.get().orbit.hubLane;
  }
}
