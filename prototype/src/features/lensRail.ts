import type { Store } from "../store/state";
import type { LensId } from "../store/types";
import type { ToastRail } from "../hud/toast";
import type { AuditController } from "./audit";

const LENS_LABELS: Record<Exclude<LensId, null>, string> = {
  F01: "شرخ", F02: "انطواء", F03: "انصهار", F04: "انعطاف", F05: "احتجاب",
  F06: "سكون", F07: "علوّ", F08: "تقارب", F09: "ارتداد",
};

// F01/F04/F06/F09 are fixture-assigned (real per-lane signal, see
// scripts/gen-fixtures.mjs). The rest are generic, computed live off the
// focused lane — documented in docs/PHASE-01-UI-SYSTEM.md §6.
const FIXTURE_LENSES = new Set<LensId>(["F01", "F04", "F06", "F09"]);
const REFUSED_PAIR: [LensId, LensId] = ["F02", "F09"];
const MAX_STACK = 2;

/**
 * The lens rail — a compact row of nine toggle chips letting the reader
 * stack F01–F09 deliberately (US-5.1). Minimal chrome, margin-adjacent,
 * never over the text; refuses undefined combinations with a named reason
 * on the rail rather than silently or by crashing.
 */
export class LensRailController {
  el: HTMLElement;

  constructor(
    mount: HTMLElement,
    private store: Store,
    private toast: ToastRail,
    private audit: AuditController,
  ) {
    this.el = document.createElement("div");
    this.el.className = "lens-rail";
    this.el.setAttribute("role", "group");
    this.el.setAttribute("aria-label", "عدسات الشذوذ التسع");
    Object.assign(this.el.style, {
      position: "fixed", bottom: "calc(var(--safe-b) + 14px)", left: "50%", translate: "-50% 0",
      display: "flex", gap: "4px", zIndex: "6", background: "var(--color-panel-glass)",
      backdropFilter: "blur(var(--blur-glass))", border: "1px solid var(--color-line)",
      borderRadius: "999px", padding: "4px",
    } as CSSStyleDeclaration);
    mount.appendChild(this.el);

    (Object.keys(LENS_LABELS) as Exclude<LensId, null>[]).forEach((id) => {
      const btn = document.createElement("button");
      btn.textContent = LENS_LABELS[id];
      btn.title = id;
      btn.dataset.lens = id;
      Object.assign(btn.style, {
        fontFamily: "var(--font-apparatus)", fontSize: "10px", color: "var(--color-text-quiet)",
        background: "transparent", border: "none", borderRadius: "999px", padding: "6px 8px",
        minHeight: "32px",
      } as CSSStyleDeclaration);
      btn.addEventListener("pointerup", () => this.toggle(id));
      this.el.appendChild(btn);
    });

    store.subscribe((s) => this.syncChips(s.activeLenses));
  }

  private syncChips(active: LensId[]): void {
    this.el.querySelectorAll<HTMLButtonElement>("button").forEach((b) => {
      const on = active.includes(b.dataset.lens as LensId);
      b.style.color = on ? "var(--color-accent)" : "var(--color-text-quiet)";
      b.style.background = on ? "color-mix(in srgb, var(--color-accent) 14%, transparent)" : "transparent";
    });
  }

  private toggle(id: Exclude<LensId, null>): void {
    const s = this.store.get();
    const willActivate = !s.activeLenses.includes(id);

    if (willActivate) {
      const wouldStack = [...s.activeLenses, id];
      const refused = REFUSED_PAIR.every((r) => wouldStack.includes(r));
      if (refused) {
        this.toast.show(`رُفض: لا تعريف لتراكب ${LENS_LABELS[REFUSED_PAIR[0]!]} مع ${LENS_LABELS[REFUSED_PAIR[1]!]}`, "refuse");
        return;
      }
      if (s.activeLenses.length >= MAX_STACK) {
        this.toast.show("رُفض: لا تعريف لتراكب أكثر من عدستين معًا", "refuse");
        return;
      }
    }

    this.store.toggleLens(id);
    if (!FIXTURE_LENSES.has(id)) this.applyComputed(id, willActivate);
  }

  private applyComputed(id: Exclude<LensId, null>, on: boolean): void {
    const s = this.store.get();
    const lane = s.focusedLane;
    const targets: Record<string, number[]> = { ...s.computedLensTargets };

    if (!on || lane === null) {
      delete targets[id];
      this.store.update({ computedLensTargets: targets });
      return;
    }

    const laneFixture = this.store.laneById(lane)!;
    switch (id) {
      case "F02": { // collapse: compress the focused lane's roots into a key + open audit
        targets[id] = [lane];
        this.audit.open(laneFixture);
        break;
      }
      case "F03": { // dissolution: merge with the nearest lane sharing a root
        const partner = this.nearestSharedRootLane(lane, 1, 3);
        targets[id] = partner ? [lane, partner] : [lane];
        if (!partner) this.toast.show("لا جذر مشترك قريب يُظهر انصهارًا على هذا السطر");
        break;
      }
      case "F05": { // shielding: sink + desaturate the focused lane briefly
        targets[id] = [lane];
        window.setTimeout(() => {
          const cur = { ...this.store.get().computedLensTargets };
          delete cur.F05;
          this.store.update({ computedLensTargets: cur });
          this.store.toggleLens("F05");
        }, 2600);
        break;
      }
      case "F07": { // elevation: the page's max-word-count lane broadcasts
        const hub = [...this.store.page.lanes].sort((a, b) => b.wordCount - a.wordCount)[0];
        targets[id] = hub ? [hub.lane] : [lane];
        break;
      }
      case "F08": { // convergence: pinch-test analog — nearest DISTANT lane sharing a root
        const partner = this.nearestSharedRootLane(lane, 4, 99);
        targets[id] = partner ? [lane, partner] : [lane];
        if (!partner) this.toast.show("لا تقارب بنيوي بعيد على هذه الصفحة لهذا السطر");
        break;
      }
    }
    this.store.update({ computedLensTargets: targets });
  }

  private nearestSharedRootLane(lane: number, minDist: number, maxDist: number): number | null {
    const laneFixture = this.store.laneById(lane)!;
    const myRoots = new Set(laneFixture.words.map((w) => w.root).filter(Boolean));
    let best: number | null = null;
    let bestDist = Infinity;
    for (const [root, lanes] of Object.entries(this.store.page.roots)) {
      if (!myRoots.has(root)) continue;
      for (const other of lanes) {
        if (other === lane) continue;
        const d = Math.abs(other - lane);
        if (d >= minDist && d <= maxDist && d < bestDist) { bestDist = d; best = other; }
      }
    }
    return best;
  }
}
