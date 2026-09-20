import type { CanvasView } from "../canvas/render";
import type { Store } from "../store/state";
import type { PressSpeed } from "../gestures/pointer";

const NS = "http://www.w3.org/2000/svg";
function svg(tag: string, attrs: Record<string, string>): SVGElement {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e as unknown as SVGElement;
}

/**
 * F19 — Inter-Row Substrate Lens, the three-speed gutter press. Each speed
 * gets a visually distinct language per spec-ui/02 §F19: filaments
 * (connections), skeletal underlay, vertical root strands. Populated once
 * per gutter at mount time; visibility/speed is CSS-driven off
 * `.gutter[data-speed]` (layout.css), set here.
 */
export function populateGutterArt(gutterRoot: HTMLElement): void {
  const filaments = gutterRoot.querySelector(".gutter__filaments")!;
  const skeleton = gutterRoot.querySelector(".gutter__skeleton")!;
  const strands = gutterRoot.querySelector(".gutter__strands")!;
  const ghosts = gutterRoot.querySelector(".gutter__ghosts")!;

  const fSvg = svg("svg", { viewBox: "0 0 100 12", preserveAspectRatio: "none" });
  for (let i = 0; i < 3; i++) {
    const y = 3 + i * 3;
    fSvg.appendChild(svg("path", { d: `M2 ${y} Q 50 ${y - 3} 98 ${y}`, stroke: "var(--color-interactive)", "stroke-width": "0.6", fill: "none", opacity: "0.75" }));
  }
  filaments.appendChild(fSvg);

  const sSvg = svg("svg", { viewBox: "0 0 100 12", preserveAspectRatio: "none" });
  sSvg.appendChild(svg("rect", { x: "0", y: "1", width: "100", height: "10", fill: "var(--color-text-quiet)", opacity: "0.12" }));
  for (let i = 0; i < 10; i++) {
    sSvg.appendChild(svg("line", { x1: String(i * 10 + 3), y1: "2", x2: String(i * 10 + 3), y2: "10", stroke: "var(--color-text-quiet)", "stroke-width": "0.5", opacity: "0.5" }));
  }
  skeleton.appendChild(sSvg);

  const rSvg = svg("svg", { viewBox: "0 0 100 12", preserveAspectRatio: "none" });
  for (let i = 0; i < 6; i++) {
    rSvg.appendChild(svg("line", { x1: String(i * 17 + 6), y1: "0", x2: String(i * 17 + 6), y2: "12", stroke: "var(--color-accent)", "stroke-width": "0.9", opacity: "0.8" }));
  }
  strands.appendChild(rSvg);

  const gSvg = svg("svg", { viewBox: "0 0 100 12", preserveAspectRatio: "none" });
  gSvg.appendChild(svg("path", { d: "M98 6 L2 6", stroke: "var(--color-danger)", "stroke-width": "0.7", "stroke-dasharray": "2 2", fill: "none" }));
  ghosts.appendChild(gSvg);
}

export class GutterLensController {
  constructor(private store: Store, private canvas: CanvasView) {
    for (const g of canvas.gutters.values()) populateGutterArt(g.root);
  }

  setSpeed(gutterLane: number, speed: PressSpeed): void {
    const g = this.canvas.gutters.get(gutterLane);
    if (!g) return;
    if (speed === 0) {
      delete g.root.dataset.speed;
      g.depthLabel.textContent = "";
    } else {
      g.root.dataset.speed = String(speed);
      g.depthLabel.textContent = String(speed);
    }
    this.store.update({ gutterSpeed: speed, gutterIndex: speed === 0 ? null : gutterLane });
  }

  clearAll(): void {
    for (const g of this.canvas.gutters.values()) {
      delete g.root.dataset.speed;
      g.depthLabel.textContent = "";
    }
    this.store.update({ gutterSpeed: 0, gutterIndex: null });
  }
}
