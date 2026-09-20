import "./styles/tokens.css";
import "./styles/typography.css";
import "./styles/motion.css";
import "./styles/layout.css";

import { Store } from "./store/state";
import { Persistence } from "./store/persistence";
import { CanvasView } from "./canvas/render";
import { mountStarfield } from "./canvas/starfield";
import { HudController } from "./hud/hud";
import { ToastRail } from "./hud/toast";
import { GutterLensController } from "./features/gutterLens";
import { EchoTrajectoryController } from "./features/echoTrajectory";
import { PathTraceLockController } from "./features/pathTraceLock";
import { AuditController } from "./features/audit";
import { LensRailController } from "./features/lensRail";
import { GestureController } from "./gestures/dictionary";
import { Onboarding } from "./onboarding/onboarding";
import type { PageFixture } from "./store/types";

import page1 from "../data/pages/page-1.json";
import page2 from "../data/pages/page-2.json";
import page3 from "../data/pages/page-3.json";

const PAGES = [page1, page2, page3] as unknown as PageFixture[];

const app = document.getElementById("app")!;

function buildEntryPlate(onEnter: () => void): void {
  const plate = document.createElement("div");
  plate.className = "entry-plate";
  plate.innerHTML = `
    <div>
      <div class="entry-plate__mark">أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَٰنِ الرَّجِيمِ</div>
      <button class="entry-plate__enter hit-44">ادخل</button>
    </div>`;
  app.appendChild(plate);
  plate.querySelector("button")!.addEventListener("click", () => {
    plate.remove();
    onEnter();
  }, { once: true });
}

function buildSettingsCorner(onReplay: () => void, onSwitchPage: (id: string) => void): void {
  const btn = document.createElement("button");
  btn.className = "settings-btn hit-44";
  btn.textContent = "⚙";
  btn.setAttribute("aria-label", "الإعدادات");
  app.appendChild(btn);

  const menu = document.createElement("div");
  menu.className = "drawer";
  menu.style.maxHeight = "40dvh";
  menu.innerHTML = `
    <div class="drawer__grip"></div>
    <div class="drawer__title">الإعدادات</div>
    <div class="drawer__row"><span>المظهر</span></div>
  `;
  const themeRow = document.createElement("div");
  themeRow.style.display = "flex";
  themeRow.style.gap = "8px";
  themeRow.style.margin = "6px 0 14px";
  for (const [label, value] of [["ليلي", "dark"], ["نهاري", "light"], ["النظام", ""]] as const) {
    const b = document.createElement("button");
    b.className = "onboarding__btn hit-44";
    b.textContent = label;
    b.addEventListener("click", () => {
      if (value) document.documentElement.setAttribute("data-theme", value);
      else document.documentElement.removeAttribute("data-theme");
    });
    themeRow.appendChild(b);
  }
  menu.appendChild(themeRow);

  const replayBtn = document.createElement("button");
  replayBtn.className = "onboarding__btn onboarding__btn--primary hit-44";
  replayBtn.textContent = "أعِد الجولة التمهيدية";
  replayBtn.style.width = "100%";
  replayBtn.style.marginBottom = "10px";
  replayBtn.addEventListener("click", () => { menu.dataset.open = "0"; onReplay(); });
  menu.appendChild(replayBtn);

  const pagesTitle = document.createElement("div");
  pagesTitle.className = "drawer__title";
  pagesTitle.textContent = "الصفحات النموذجية";
  menu.appendChild(pagesTitle);
  for (const p of PAGES) {
    const b = document.createElement("button");
    b.className = "onboarding__btn hit-44";
    b.style.width = "100%";
    b.style.marginBottom = "6px";
    b.style.textAlign = "start";
    b.textContent = p.title;
    b.addEventListener("click", () => { menu.dataset.open = "0"; onSwitchPage(p.id); });
    menu.appendChild(b);
  }

  app.appendChild(menu);
  btn.addEventListener("click", () => { menu.dataset.open = menu.dataset.open === "1" ? "0" : "1"; });
  menu.addEventListener("click", (e) => { if (e.target === menu || (e.target as HTMLElement).classList.contains("drawer__grip")) menu.dataset.open = "0"; });
}

function boot(pageId: string): void {
  app.innerHTML = "";
  const page = PAGES.find((p) => p.id === pageId) ?? PAGES[0];

  const store = new Store(page);
  const persistence = new Persistence();
  const canvas = new CanvasView(app, store);
  mountStarfield(canvas.starfield);

  const hud = new HudController(store);
  const toast = new ToastRail(canvas.root);
  const gutterLens = new GutterLensController(store, canvas);
  const echo = new EchoTrajectoryController(store, canvas);
  const lock = new PathTraceLockController(store, canvas);
  const audit = new AuditController(canvas.root, store, persistence);
  new LensRailController(canvas.root, store, toast, audit);
  new GestureController(store, canvas, hud, toast, gutterLens, echo, lock, audit, persistence);

  const trackGlyph = document.createElement("div");
  trackGlyph.className = "track-glyph";
  canvas.root.appendChild(trackGlyph);
  const trackLabel = (m: string) => (m === "runway" ? "الممرّ" : m === "excavator" ? "الحفّار" : "المصادِم");
  store.subscribe((s) => { trackGlyph.textContent = trackLabel(s.track.mode); });
  trackGlyph.textContent = trackLabel(store.get().track.mode);

  let deepInteractionCount = 0;
  lock.onEncounter = () => bumpTrack();
  const bumpTrack = () => {
    deepInteractionCount += 1;
    if (deepInteractionCount >= 3 && store.get().track.mode === "runway" && !store.get().track.pinned) {
      store.setTrack("excavator");
      toast.show("انتقل المسار إلى وضع الحفّار — العدسات كلّها متاحة الآن");
    }
  };
  store.subscribe((s, prev) => { if (s.activeLenses.length > prev.activeLenses.length) bumpTrack(); });

  store.subscribe((s) => canvas.render(s));
  canvas.render(store.get());

  const onboarding = new Onboarding(canvas.root, store);
  window.setTimeout(() => onboarding.start(), 500);

  const session = persistence.startSession(page.id, store.get().track.mode);
  let sessionId: string | null = null;
  void session.then((s) => { sessionId = s.id; });
  store.subscribe((s) => {
    if (!sessionId) return;
    const deepest = Math.max(s.gutterSpeed, 0) as 0 | 1 | 2 | 3;
    void persistence.updateSession(sessionId, { deepestLensSpeed: deepest });
    persistence.saveNavigationState({
      pageId: s.pageId,
      focusedLane: s.focusedLane,
      activeLenses: s.activeLenses,
      hudDensity: s.railDensity,
      orbitHub: s.orbit.active && s.orbit.hubLane !== null && s.orbit.hubWordIndex !== null ? { lane: s.orbit.hubLane, wordIndex: s.orbit.hubWordIndex } : null,
      rasmOn: s.rasm.active,
      track: s.track.mode,
      trackPinned: s.track.pinned,
    });
  });

  buildSettingsCorner(
    () => onboarding.replay(),
    (id) => boot(id),
  );
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => { /* offline shell degrades to normal fetch */ });
  });
}

buildEntryPlate(() => boot(PAGES[0].id));
