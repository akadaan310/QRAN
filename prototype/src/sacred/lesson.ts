/**
 * The wordless first-run lesson (§9).
 *
 * Roughly twenty seconds, no words at all: a ring settles over one real
 * control at a time and pulses; a tap moves on, and so does five seconds of
 * not tapping. The lesson teaches the four things the whole interface is
 * built from — a word opens, a margin mark opens, the compass opens, ✕ closes
 * — and because every glyph is identical everywhere, that is the entire
 * interface learned.
 *
 * It runs once. If the reader clears their storage it runs again, which is
 * the right failure: a reader who has lost the app's memory has probably lost
 * their own.
 */

import { GLYPH, DISMISS } from "./glyphs";

const SEEN = "qran.lesson";
const BEAT = 5000;

export function lessonSeen(): boolean {
  try {
    return localStorage.getItem(SEEN) === "1";
  } catch {
    // Storage blocked (private window, cleared site data). Teaching a reader
    // twice is a smaller harm than never teaching them at all.
    return false;
  }
}

function remember(): void {
  try {
    localStorage.setItem(SEEN, "1");
  } catch {
    /* nothing to remember with; the lesson simply runs again */
  }
}

export function runLesson(host: HTMLElement, targets: () => (HTMLElement | null)[]): void {
  const overlay = document.createElement("div");
  overlay.className = "lesson";
  const ring = document.createElement("div");
  ring.className = "lesson__ring";
  const ghost = document.createElement("div");
  ghost.className = "lesson__ghost";
  overlay.append(ring, ghost);
  host.appendChild(overlay);

  const glyphs = [GLYPH.word, GLYPH.path, GLYPH.compass, DISMISS];
  let beat = 0;
  let timer = 0;

  const place = (): void => {
    const target = targets()[beat];
    if (!target) {
      advance();
      return;
    }
    const box = target.getBoundingClientRect();
    const host_box = host.getBoundingClientRect();
    ring.style.top = `${box.top - host_box.top + box.height / 2}px`;
    ring.style.left = `${box.left - host_box.left + box.width / 2}px`;
    ring.style.width = `${Math.max(box.width, 28) + 28}px`;
    ring.style.height = `${Math.max(box.height, 28) + 28}px`;
    ghost.style.top = ring.style.top;
    ghost.style.left = ring.style.left;
    ghost.textContent = glyphs[beat];
  };

  const advance = (): void => {
    window.clearTimeout(timer);
    beat += 1;
    if (beat >= glyphs.length) {
      overlay.dataset.leaving = "1";
      window.setTimeout(() => overlay.remove(), 400);
      remember();
      return;
    }
    place();
    timer = window.setTimeout(advance, BEAT);
  };

  overlay.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    advance();
  });

  requestAnimationFrame(() => {
    overlay.dataset.open = "1";
    place();
    timer = window.setTimeout(advance, BEAT);
  });
}
