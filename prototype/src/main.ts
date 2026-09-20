/**
 * Entry.
 *
 * The app opens to the Quran — FINALITY_PROMPT §9's first architecture, and
 * the reason this file is four lines of work: there is no entry plate to
 * dismiss, no settings corner, no tour of labelled panels. The Phase-1
 * modules under `src/canvas`, `src/features`, `src/gestures`, `src/hud` and
 * `src/onboarding` remain in the tree as the record of the surface §9
 * superseded; they are still type-checked by `npm run build` and their
 * fixtures are still pinned by `npm run verify`.
 */

import "./styles/tokens.css";
import "./styles/typography.css";
import "./styles/motion.css";
import "./sacred/sacred.css";

import { boot } from "./sacred/app";
import { stillness } from "./sacred/layer";

const host = document.getElementById("app")!;

function start(): void {
  host.replaceChildren();
  boot(host).catch(() => {
    // Offline before the corpus is cached, or a corrupt fetch. Stillness,
    // then ↻ — the only failure surface §9 allows.
    stillness(host, start);
  });
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* the app degrades to a normal online fetch */
    });
  });
}

start();
