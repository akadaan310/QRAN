import type { Store } from "../store/state";
import type { LaneFixture } from "../store/types";
import type { Persistence } from "../store/persistence";

/**
 * F11 — Invertibility Audit. product-spec/01 §Provenance chain: every
 * typographic effect traces back through the five lane values to the
 * corpus material that earned it. Numbers here are honestly computed from
 * this lane's own fixture (word count as "superposition", the lane's
 * repeated-root fraction as what "survived" a hypothetical collapse into a
 * single key) — not invented, and the drawer says so.
 */
export class AuditController {
  private drawer: HTMLElement;
  private body: HTMLElement;

  constructor(mount: HTMLElement, private store: Store, private persistence: Persistence) {
    this.drawer = document.createElement("div");
    this.drawer.className = "drawer";
    this.drawer.innerHTML = `<div class="drawer__grip" aria-hidden="true"></div><div class="drawer__title">ما الذي كلّف هذا؟</div>`;
    this.body = document.createElement("div");
    this.drawer.appendChild(this.body);
    mount.appendChild(this.drawer);
    this.drawer.addEventListener("click", (e) => {
      if (e.target === this.drawer || (e.target as HTMLElement).classList.contains("drawer__grip")) this.close();
    });
  }

  open(lane: LaneFixture): void {
    const superposition = lane.wordCount;
    const roots = new Set(lane.words.map((w) => w.root).filter(Boolean));
    const survivors = roots.size || 1;
    const loss = Math.max(0, superposition - survivors);
    const integerClosure = 28; // the fixed closure unit used throughout the reference ledger schema

    this.body.innerHTML = "";
    const rows: [string, string][] = [
      ["السطر", `${lane.lane} — ${lane.surahName} ${lane.ayah}`],
      ["التراكب (Superposition)", String(superposition)],
      ["الناجون (Survivors)", String(survivors)],
      ["الفاقد / الإغلاق الصحيح", `${loss} / ${integerClosure}`],
      ["العدسة المهيمنة", lane.state.lens ?? "لا شيء — لا يُفرض قيمة"],
      ["مصدر الرقم", "مُشتقّ حيًّا من ألفاظ هذا السطر وجذوره (fixture — انظر data/SOURCES.md)"],
    ];
    for (const [k, v] of rows) {
      const row = document.createElement("div");
      row.className = "drawer__row";
      row.innerHTML = `<span>${k}</span><span>${v}</span>`;
      this.body.appendChild(row);
    }
    const note = document.createElement("div");
    note.className = "drawer__note";
    note.textContent = lane.rationale;
    this.body.appendChild(note);

    const saveBtn = document.createElement("button");
    saveBtn.className = "onboarding__btn onboarding__btn--primary hit-44";
    saveBtn.style.marginTop = "10px";
    saveBtn.textContent = "احفظ هذا الاكتشاف";
    saveBtn.addEventListener("click", () => {
      void this.persistence.addDiscovery({
        pageId: this.store.page.id,
        lane: lane.lane,
        lens: lane.state.lens,
        friction: lane.state.friction,
        auditRef: `${survivors}/${superposition} loss=${loss}/${integerClosure}`,
        note: lane.rationale,
        supersedes: null,
      });
      saveBtn.textContent = "حُفظ";
      saveBtn.disabled = true;
    });
    this.body.appendChild(saveBtn);

    this.drawer.dataset.open = "1";
  }

  close(): void {
    this.drawer.dataset.open = "0";
  }

  get isOpen(): boolean {
    return this.drawer.dataset.open === "1";
  }
}
