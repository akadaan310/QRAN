/**
 * The Page (§8.1 / §9 "Architectures: the Page").
 *
 * The app opens to Quran text and never leaves it. One screen is one Madani
 * page — the real 604-page division carried in `ayat.json`, not a synthetic
 * grouping — rendered full-bleed as continuous RTL Uthmani and fitted to the
 * viewport. Instrumentation never covers a letterform: the ◈ and ◉ marks live
 * in a margin rail, positioned against the line an ayah begins on, and the
 * page's own glyph rail sits below the text block.
 *
 * Honest limitation, recorded here and in QA_NOTES: no per-line typesetting
 * dataset is vendored, so the text *flows* and is then fitted so a page
 * occupies roughly the fifteen lines a Madani muṣḥaf prints. The page
 * division is real; the line breaks inside it are the browser's.
 */

import { corpus, ayahKey, type AyahRow } from "./corpus";
import { renderAyah } from "./ayah";
import { GLYPH, mark } from "./glyphs";
import { keep } from "./keep";

const TARGET_LINES = 15;
const LINE_HEIGHT = 1.95;
const MIN_SIZE = 13;
const MAX_SIZE = 72;

export interface PageEvents {
  onWord: (surah: number, ayah: number, position: number, node: HTMLElement) => void;
  onPath: (surah: number, ayah: number) => void;
  onAddressed: (surah: number, ayah: number) => void;
  onCompass: () => void;
  onCompose: () => void;
  onKeep: (surah: number, ayah: number) => void;
}

export class Page {
  readonly root: HTMLElement;
  private readonly sheet: HTMLElement;
  private readonly body: HTMLElement;
  private readonly margin: HTMLElement;
  private readonly rail: HTMLElement;
  private anchoredAyahs = new Set<number>();
  private addressedAyahs = new Set<number>();
  private current = 1;
  private rasmOn = false;
  private fitting = 0;

  constructor(host: HTMLElement, private readonly events: PageEvents) {
    this.root = document.createElement("main");
    this.root.className = "page";

    this.margin = document.createElement("div");
    this.margin.className = "page__margin";

    this.sheet = document.createElement("div");
    this.sheet.className = "page__sheet";
    this.sheet.dir = "rtl";
    this.sheet.lang = "ar";

    // The text lives in its own block inside the scroller. Measuring the
    // scroller itself is useless: `scrollHeight` never reports less than the
    // box, so a page that under-fills measures exactly as tall as one that
    // fits, and the fit cannot tell "too small" from "just right".
    this.body = document.createElement("div");
    this.body.className = "page__body";
    this.sheet.appendChild(this.body);

    this.rail = document.createElement("nav");
    this.rail.className = "page__rail";

    const compass = mark(GLYPH.compass, "compass");
    compass.addEventListener("click", () => this.events.onCompass());
    const rasm = mark(GLYPH.rasm, "rasm");
    rasm.addEventListener("click", () => this.toggleRasm());
    const compose = mark(GLYPH.compose, "compose");
    compose.addEventListener("click", () => this.events.onCompose());
    this.rail.append(compass, rasm, compose);

    this.root.append(this.margin, this.sheet, this.rail);
    host.appendChild(this.root);

    this.bindGestures();
    window.addEventListener("resize", () => this.fit(() => this.placeMarks(corpus.page(this.current))));
  }

  /** Which ayah the reader is standing on — the anchor ✕ always returns to. */
  get here(): { page: number; surah: number; ayah: number } {
    const first = corpus.page(this.current)[0];
    return { page: this.current, surah: first?.[0] ?? 1, ayah: first?.[1] ?? 1 };
  }

  get rasm(): boolean {
    return this.rasmOn;
  }

  async prime(): Promise<void> {
    const [anchored, addressals] = await Promise.all([corpus.ayahPaths(), corpus.addressals()]);
    this.anchoredAyahs = new Set(Object.keys(anchored).map(Number));
    this.addressedAyahs = new Set();
    for (const entry of addressals) {
      for (const [surah, ayah] of entry.loci) this.addressedAyahs.add(ayahKey(surah, ayah));
    }
  }

  show(page: number): void {
    this.current = Math.min(604, Math.max(1, Math.trunc(page)));
    const rows = corpus.page(this.current);
    this.body.replaceChildren();

    let previousSurah = -1;
    for (const row of rows) {
      if (previousSurah !== -1 && row[0] !== previousSurah) {
        // A new surah opens. No name, no heading — §9 admits no words but the
        // Quran's, and a surah's name is not in the Quran's own text. The
        // break is shown as a break: space and a hairline.
        const seam = document.createElement("div");
        seam.className = "page__seam";
        this.body.appendChild(seam);
      }
      previousSurah = row[0];
      this.body.appendChild(renderAyah(row[0], row[1], { rasm: this.rasmOn }));
      this.body.appendChild(document.createTextNode(" "));
    }

    // Marks are positioned against measured line boxes, so they are placed
    // only once the fit has chosen a font size — otherwise every mark lands
    // against the pre-fit layout and sits a few lines off.
    this.fit(() => this.placeMarks(rows));
    void keep.remember(this.current, rows[0]?.[0] ?? 1, rows[0]?.[1] ?? 1);
  }

  /** Jump to the page a locus is printed on and light that ayah briefly. */
  goto(surah: number, ayah: number): void {
    this.show(corpus.pageOf(surah, ayah));
    const node = this.body.querySelector<HTMLElement>(`.ayah[data-s="${surah}"][data-a="${ayah}"]`);
    if (!node) return;
    node.dataset.arrived = "1";
    node.scrollIntoView({ block: "center", behavior: "auto" });
    window.setTimeout(() => delete node.dataset.arrived, 1600);
  }

  step(delta: number): void {
    const next = this.current + delta;
    if (next < 1 || next > 604) return;
    this.root.dataset.turning = delta > 0 ? "next" : "prev";
    window.setTimeout(() => delete this.root.dataset.turning, 260);
    this.show(next);
  }

  toggleRasm(): void {
    this.rasmOn = !this.rasmOn;
    this.root.dataset.rasm = this.rasmOn ? "1" : "0";
    this.show(this.current);
  }

  /**
   * Fit the page to the viewport at roughly fifteen lines. Binary search on
   * font size against the measured line count — cheap (≈7 reflows of one
   * block) and stable across viewport sizes and font loading.
   */
  private fit(then?: () => void): void {
    cancelAnimationFrame(this.fitting);
    this.fitting = requestAnimationFrame(() => {
      const available = this.sheet.clientHeight;
      if (!available) {
        then?.();
        return;
      }
      // Grow the text until it either fills the page or reaches the fifteen
      // lines a Madani muṣḥaf prints, whichever comes first. Both bounds
      // matter: a short page (the last page of a sūra) must still be readable
      // at a sane size rather than blown up to fill the screen, and a long one
      // must not spill past the fold.
      let low = MIN_SIZE;
      let high = MAX_SIZE;
      let best = low;
      for (let pass = 0; pass < 8; pass += 1) {
        const size = (low + high) / 2;
        this.body.style.fontSize = `${size}px`;
        const height = this.body.offsetHeight;
        const lines = height / (size * LINE_HEIGHT);
        if (height <= available && lines <= TARGET_LINES) {
          best = size;
          low = size;
        } else {
          high = size;
        }
      }
      this.body.style.fontSize = `${best}px`;
      then?.();
    });
  }

  /**
   * Margin marks: a ◈ where a walk passes through this ayah, a ◉ where the
   * ayah calls someone by name. Positioned against the ayah's first line, in
   * the margin strip — never over a letterform (the covenant's third rule).
   */
  private placeMarks(rows: AyahRow[]): void {
    this.margin.replaceChildren();
    const origin = this.root.getBoundingClientRect().top;
    // Several ayahs can begin on one line — the short sūras stack four or
    // five to a line — and marks placed at their raw line tops land on top of
    // each other, making the upper ones untappable. Each mark is pushed below
    // the last one placed, so every mark on the page stays reachable.
    const CELL = 19;
    let floor = 0;
    for (const row of rows) {
      const key = ayahKey(row[0], row[1]);
      const hasPath = this.anchoredAyahs.has(key);
      const hasAddress = this.addressedAyahs.has(key);
      if (!hasPath && !hasAddress) continue;
      const node = this.body.querySelector<HTMLElement>(`.ayah[data-s="${row[0]}"][data-a="${row[1]}"]`);
      if (!node) continue;
      const rect = node.getClientRects()[0];
      if (!rect) continue;
      // A cell is as tall as the glyphs it stacks, so the next cell clears
      // all of them — not just the first.
      const height = (hasPath ? 1 : 0) + (hasAddress ? 1 : 0);
      const top = Math.max(rect.top - origin, floor);
      floor = top + height * CELL;
      const cell = document.createElement("div");
      cell.className = "page__mark";
      cell.style.top = `${top}px`;
      if (hasPath) {
        const glyph = mark(GLYPH.path, "path");
        glyph.addEventListener("click", () => this.events.onPath(row[0], row[1]));
        cell.appendChild(glyph);
      }
      if (hasAddress) {
        const glyph = mark(GLYPH.addressed, "addressed");
        glyph.addEventListener("click", () => this.events.onAddressed(row[0], row[1]));
        cell.appendChild(glyph);
      }
      this.margin.appendChild(cell);
    }
  }

  private bindGestures(): void {
    let holdTimer = 0;
    let held = false;
    let startX = 0;
    let startY = 0;

    this.sheet.addEventListener("pointerdown", (event) => {
      const word = (event.target as HTMLElement).closest<HTMLElement>(".w");
      startX = event.clientX;
      startY = event.clientY;
      held = false;
      if (!word) return;
      // Long-press keeps the ayah (§9 "kept places"), short tap opens the word.
      holdTimer = window.setTimeout(() => {
        held = true;
        this.events.onKeep(Number(word.dataset.s), Number(word.dataset.a));
      }, 520);
    });

    const cancelHold = () => window.clearTimeout(holdTimer);
    this.sheet.addEventListener("pointercancel", cancelHold);
    this.sheet.addEventListener("pointermove", (event) => {
      if (Math.abs(event.clientX - startX) > 8 || Math.abs(event.clientY - startY) > 8) cancelHold();
    });

    this.sheet.addEventListener("pointerup", (event) => {
      cancelHold();
      if (held) return;
      const word = (event.target as HTMLElement).closest<HTMLElement>(".w");
      if (!word) return;
      if (Math.abs(event.clientX - startX) > 12 || Math.abs(event.clientY - startY) > 12) return;
      this.events.onWord(Number(word.dataset.s), Number(word.dataset.a), Number(word.dataset.p), word);
    });

    // Turning the page: a horizontal drag across the sheet. In an RTL page,
    // dragging the text to the left turns forward, the way paper does.
    let swipeX: number | null = null;
    let swipeY = 0;
    this.sheet.addEventListener("pointerdown", (event) => {
      swipeX = event.clientX;
      swipeY = event.clientY;
    });
    this.sheet.addEventListener("pointerup", (event) => {
      if (swipeX === null) return;
      const dx = event.clientX - swipeX;
      const dy = event.clientY - swipeY;
      swipeX = null;
      if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      this.step(dx < 0 ? 1 : -1);
    });
  }
}
