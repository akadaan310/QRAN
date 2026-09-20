/**
 * Boot — the sacred interface (FINALITY_PROMPT §§1–9).
 *
 * The app opens to the Quran and stays there. This file wires the Page to the
 * eight layers and to the keyboard, and does nothing else: there is no home
 * screen to build, no navigation chrome to assemble, no strings to localize.
 * That absence is the design.
 */

import { corpus } from "./corpus";
import { Page } from "./page";
import { keep } from "./keep";
import { dismissAll, dismissTop, layerDepth, breathe } from "./layer";
import { lessonSeen, runLesson } from "./lesson";
import { openWord } from "./layers/word";
import { openRoot } from "./layers/root";
import { openPath } from "./layers/path";
import { openAddressed } from "./layers/addressed";
import { openField } from "./layers/field";
import { openCompass } from "./layers/compass";
import { openCompose } from "./layers/compose";

export async function boot(host: HTMLElement): Promise<Page> {
  await corpus.boot();
  await corpus.loadText();

  // Every jump ends on the page. A locus tapped inside a layer is a request
  // to go and stand there, so the whole stack unwinds and the reader arrives
  // on the ayah itself — §9's "the reader never leaves the Quran" read
  // forwards rather than backwards.
  const jump = (surah: number, ayah: number): void => {
    dismissAll();
    page.goto(surah, ayah);
  };

  const page: Page = new Page(host, {
    onWord: (surah, ayah, position) =>
      void openWord(
        {
          host,
          rasm: page.rasm,
          onJump: jump,
          onRoot: (root) => void openRoot({ host, rasm: page.rasm, onJump: jump }, root),
          onField: (marker, seed) => void openField({ host, rasm: page.rasm, onJump: jump }, marker, seed),
        },
        surah,
        ayah,
        position
      ),
    onPath: (surah, ayah) =>
      void openPath(
        {
          host,
          rasm: page.rasm,
          onJump: jump,
          onCompose: (s, a) => void openCompose({ host, rasm: page.rasm, onJump: jump }, s, a),
        },
        surah,
        ayah
      ),
    onAddressed: (surah, ayah) => void openAddressed({ host, rasm: page.rasm, onJump: jump }, surah, ayah),
    onCompass: () =>
      void openCompass({
        host,
        rasm: page.rasm,
        page: page.here.page,
        onGoto: jump,
        onPage: (target) => page.show(target),
      }),
    onCompose: () => {
      const { surah, ayah } = page.here;
      void openCompose({ host, rasm: page.rasm, onJump: jump }, surah, ayah);
    },
    onKeep: (surah, ayah) => {
      void keep.toggle(surah, ayah).then(() => {
        const node = host.querySelector<HTMLElement>(`.ayah[data-s="${surah}"][data-a="${ayah}"]`);
        if (node) breathe(node);
      });
    },
  });

  await page.prime();

  // Silent return: the reader comes back where they left, with nothing said
  // about it. A first-time reader opens at the first page.
  const place = await keep.recall();
  page.show(place?.page ?? 1);

  bindKeyboard(page);

  if (!lessonSeen()) {
    // The lesson points at real controls, resolved when each beat runs so it
    // survives the page re-rendering underneath it.
    runLesson(host, () => [
      host.querySelector<HTMLElement>(".page__sheet .w"),
      host.querySelector<HTMLElement>('.page__mark [data-mark="path"]') ??
        host.querySelector<HTMLElement>('.page__mark [data-mark="addressed"]'),
      host.querySelector<HTMLElement>('.page__rail [data-mark="compass"]'),
      host.querySelector<HTMLElement>('.page__rail [data-mark="rasm"]'),
    ]);
  }

  return page;
}

/**
 * The keyboard is a fallback path to the same gestures, not a second
 * interface: arrows turn the page, Escape dismisses a layer exactly as ✕
 * does, and the three page-rail glyphs answer to their own first letters
 * being unavailable — so they answer to position instead.
 */
function bindKeyboard(page: Page): void {
  window.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement) return;
    switch (event.key) {
      case "Escape":
        if (dismissTop()) event.preventDefault();
        break;
      case "ArrowLeft":
        if (layerDepth() === 0) page.step(1);
        break;
      case "ArrowRight":
        if (layerDepth() === 0) page.step(-1);
        break;
      case "ArrowDown":
        if (layerDepth() === 0) page.step(1);
        break;
      case "ArrowUp":
        if (layerDepth() === 0) page.step(-1);
        break;
      case " ":
        if (layerDepth() === 0) {
          event.preventDefault();
          page.toggleRasm();
        }
        break;
      default:
        break;
    }
  });
}
