import { el } from "./shell";
import { goto } from "./routerInstance";
import { Store } from "../store/state";
import { Persistence } from "../store/persistence";
import { CanvasView } from "../canvas/render";
import { mountStarfield } from "../canvas/starfield";
import { HudController } from "../hud/hud";
import { ToastRail } from "../hud/toast";
import { GutterLensController } from "../features/gutterLens";
import { EchoTrajectoryController } from "../features/echoTrajectory";
import { PathTraceLockController } from "../features/pathTraceLock";
import { AuditController } from "../features/audit";
import { LensRailController } from "../features/lensRail";
import { GestureController } from "../gestures/dictionary";
import { Onboarding } from "../onboarding/onboarding";
import { openWordSheet } from "./wordSheet";
import type { PageFixture } from "../store/types";

export interface CanvasHostNav {
  onPrev?: () => void;
  onNext?: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  locusText: string;
  homePath?: string; // where the ⌂ button in the topbar goes; defaults to فهرس
}

/**
 * Mounts the full canvas engine (Store, CanvasView, governor, gestures,
 * HUD, features — the Phase-1 system, unchanged) plus reader chrome
 * (topbar, prev/next nav) against any PageFixture. Used by the whole-Quran
 * reader (consecutive loci) and by the §7.1/§7.3 journey screens
 * (non-consecutive loci — a QALAM scenario's connected ayahs, a vocative's
 * every occurrence) alike, since buildScreen accepts an arbitrary Locus[].
 */
export async function mountCanvasScreen(container: HTMLElement, page: PageFixture, nav: CanvasHostNav): Promise<() => void> {
  const shell = el("div", "app-shell");
  container.appendChild(shell);

  const topbar = el("div", "topbar");
  const homeBtn = el("button", "topbar__home hit-44", { "aria-label": "الفهرس" });
  homeBtn.textContent = "⌂";
  homeBtn.addEventListener("click", () => goto(nav.homePath ?? ""));
  const title = el("div", "topbar__title");
  title.style.textAlign = "center";
  title.style.fontSize = "13px";
  title.style.fontFamily = "var(--font-apparatus)";
  title.textContent = page.title;
  const spacer = el("div", "topbar__home");
  spacer.style.visibility = "hidden";
  topbar.append(homeBtn, title, spacer);
  shell.appendChild(topbar);

  const canvasMount = el("div");
  canvasMount.style.paddingBottom = "70px";
  shell.appendChild(canvasMount);

  const store = new Store(page);
  const persistence = new Persistence();
  const canvas = new CanvasView(canvasMount, store);
  mountStarfield(canvas.starfield);

  const hud = new HudController(store);
  const toast = new ToastRail(canvas.root);
  const gutterLens = new GutterLensController(store, canvas);
  const echo = new EchoTrajectoryController(store, canvas);
  const lock = new PathTraceLockController(store, canvas);
  const audit = new AuditController(canvas.root, store, persistence);
  new LensRailController(canvas.root, store, toast, audit);
  const gestures = new GestureController(store, canvas, hud, toast, gutterLens, echo, lock, audit, persistence);
  gestures.onWordTap = (lane, wordIndex, root) => {
    const fx = store.laneById(lane);
    const wf = fx?.words.find((w) => w.i === wordIndex);
    if (wf) void openWordSheet(canvas.root, wf.marked, root);
  };

  store.subscribe((s) => canvas.render(s));
  canvas.render(store.get());

  const onboarding = new Onboarding(canvas.root, store);
  const onboardTimer = window.setTimeout(() => onboarding.start(), 500);

  const session = persistence.startSession(page.id, store.get().track.mode);
  let sessionId: string | null = null;
  void session.then((s) => { sessionId = s.id; });
  const unsub = store.subscribe((s) => {
    if (!sessionId) return;
    void persistence.updateSession(sessionId, { deepestLensSpeed: Math.max(s.gutterSpeed, 0) as 0 | 1 | 2 | 3 });
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

  if (nav.onPrev || nav.onNext) {
    const bar = el("div", "reader-nav");
    const prevBtn = el("button", "reader-nav__btn hit-44");
    prevBtn.textContent = "→ السابق";
    prevBtn.disabled = Boolean(nav.prevDisabled) || !nav.onPrev;
    if (nav.onPrev) prevBtn.addEventListener("click", nav.onPrev);
    const locusInfo = el("div", "reader-nav__locus");
    locusInfo.textContent = nav.locusText;
    const nextBtn = el("button", "reader-nav__btn hit-44");
    nextBtn.textContent = "التالي ←";
    nextBtn.disabled = Boolean(nav.nextDisabled) || !nav.onNext;
    if (nav.onNext) nextBtn.addEventListener("click", nav.onNext);
    bar.append(prevBtn, locusInfo, nextBtn);
    shell.appendChild(bar);
  }

  return () => {
    window.clearTimeout(onboardTimer);
    unsub();
    gestures.destroy();
  };
}
