/**
 * An orderable occurrence list — the body of the ✦ word layer, the ❖ root
 * layer, and every field or journey that is "these ayahs, in this order".
 *
 * §9: every occurrence renders as its *complete ayah text*, with the word
 * that put it there lit, and tapping it takes the canvas to that locus. The
 * four ordering marks (▪ ▮ ▬ ▭) re-group the same occurrences by mushaf, by
 * surah, by juz, by page. Grouping is shown as seams between blocks rather
 * than as headings: a heading would be a word, or a bare number, and §9
 * allows neither outside the end-marker and the compass.
 *
 * Long lists grow as the reader reaches their end (a root like قول carries
 * over a thousand ayahs); nothing announces that more is coming.
 */

import { corpus, unpack } from "./corpus";
import { renderAyahLine } from "./ayah";
import { ORDER, ORDER_SEQUENCE, mark, type OrderName } from "./glyphs";

const CHUNK = 18;

export interface OccurrenceListOptions {
  /** Packed occurrences (s*1e6 + a*1e3 + pos), or plain [surah, ayah] loci. */
  packed?: number[];
  loci?: [number, number, number[] | number | undefined][];
  rasm?: boolean;
  onJump: (surah: number, ayah: number) => void;
  /** Ordering is offered only where the reader can meaningfully re-group. */
  orderable?: boolean;
}

interface Entry {
  surah: number;
  ayah: number;
  positions: number[];
}

function collect(options: OccurrenceListOptions): Entry[] {
  const byAyah = new Map<number, Entry>();
  const add = (surah: number, ayah: number, position?: number) => {
    const key = surah * 1000 + ayah;
    let entry = byAyah.get(key);
    if (!entry) {
      entry = { surah, ayah, positions: [] };
      byAyah.set(key, entry);
    }
    if (position && !entry.positions.includes(position)) entry.positions.push(position);
  };
  for (const key of options.packed ?? []) {
    const { surah, ayah, pos } = unpack(key);
    add(surah, ayah, pos);
  }
  for (const [surah, ayah, positions] of options.loci ?? []) {
    if (Array.isArray(positions)) {
      if (positions.length === 0) add(surah, ayah);
      for (const position of positions) add(surah, ayah, position);
    } else {
      add(surah, ayah, positions);
    }
  }
  return [...byAyah.values()].sort((a, b) => a.surah - b.surah || a.ayah - b.ayah);
}

/** The value each ordering groups on. Mushaf order groups on nothing. */
function bucket(order: OrderName, entry: Entry): number {
  if (order === "surah") return entry.surah;
  if (order === "juz") return corpus.juzOf(entry.surah, entry.ayah);
  if (order === "page") return corpus.pageOf(entry.surah, entry.ayah);
  return 0;
}

export function mountOccurrences(host: HTMLElement, options: OccurrenceListOptions): void {
  const entries = collect(options);
  let order: OrderName = "mushaf";

  const controls = document.createElement("div");
  controls.className = "orders";
  const list = document.createElement("div");
  list.className = "occ";
  const sentinel = document.createElement("div");
  sentinel.className = "occ__more";

  if (options.orderable !== false && entries.length > 1) {
    for (const name of ORDER_SEQUENCE) {
      const glyph = mark(ORDER[name], `order-${name}`);
      glyph.dataset.on = name === order ? "1" : "0";
      glyph.addEventListener("click", () => {
        order = name;
        for (const sibling of controls.children) {
          (sibling as HTMLElement).dataset.on = (sibling as HTMLElement).dataset.mark === `order-${name}` ? "1" : "0";
        }
        draw();
      });
      controls.appendChild(glyph);
    }
    host.appendChild(controls);
  }
  host.append(list, sentinel);

  let shown = 0;
  let previousBucket: number | null = null;

  function grow(): void {
    const slice = entries.slice(shown, shown + CHUNK);
    for (const entry of slice) {
      const group = bucket(order, entry);
      if (previousBucket !== null && group !== previousBucket) {
        const seam = document.createElement("div");
        seam.className = "occ__seam";
        list.appendChild(seam);
      }
      previousBucket = group;
      const line = renderAyahLine(entry.surah, entry.ayah, {
        highlight: entry.positions,
        rasm: options.rasm,
      });
      line.tabIndex = 0;
      line.dataset.jump = "1";
      const jump = () => options.onJump(entry.surah, entry.ayah);
      line.addEventListener("click", jump);
      line.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          jump();
        }
      });
      list.appendChild(line);
    }
    shown += slice.length;
    sentinel.dataset.done = shown >= entries.length ? "1" : "0";
  }

  function draw(): void {
    list.replaceChildren();
    shown = 0;
    previousBucket = null;
    grow();
  }

  draw();

  const observer = new IntersectionObserver((records) => {
    if (records.some((record) => record.isIntersecting) && shown < entries.length) grow();
  }, { root: null, rootMargin: "400px" });
  observer.observe(sentinel);
}
