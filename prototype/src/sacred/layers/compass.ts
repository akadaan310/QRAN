/**
 * ◍ — the compass (§8.3 / §9).
 *
 * The wordless index. A surah is faced by its own opening ayah, because a
 * surah's *name* is not in the Quran's text and §9 admits no other words:
 * recognition happens through the text itself. The thirty ajzāʾ and the 604
 * pages are the two places besides the end-marker where §9 permits Eastern
 * numerals, so they are shown as numerals and nothing else.
 *
 * Search is by the letters themselves — an Arabic field with no placeholder,
 * matching folded word forms against the corpus. Absence is shown by
 * stillness: an empty result is an empty space, never a sentence.
 */

import { corpus } from "../corpus";
import { renderAyah } from "../ayah";
import { eastern } from "../numerals";
import { openLayer } from "../layer";
import { letterMatch } from "../normalize";
import { mountOccurrences } from "../occurrences";
import { keep } from "../keep";

const OPENING_WORDS = 7;

export interface CompassContext {
  host: HTMLElement;
  rasm: boolean;
  page: number;
  onGoto: (surah: number, ayah: number) => void;
  onPage: (page: number) => void;
}

export async function openCompass(context: CompassContext): Promise<void> {
  const layer = openLayer(context.host);
  layer.root.dataset.kind = "compass";
  layer.body.dir = "rtl";

  // --- the 114, faced by their opening ayah -------------------------------
  const surahs = document.createElement("div");
  surahs.className = "compass__surahs";
  for (const surah of corpus.surahs) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "compass__surah";
    cell.dir = "rtl";
    // The first few words of how the sūra opens — enough to recognise any of
    // the 114 by its own text, since its name is not in the Quran's.
    const opening = renderAyah(surah.n, 1, { rasm: context.rasm, bare: true, limit: OPENING_WORDS });
    cell.appendChild(opening);
    cell.addEventListener("click", () => {
      context.onGoto(surah.n, 1);
      layer.close();
    });
    surahs.appendChild(cell);
  }

  // --- the thirty ajzāʾ ----------------------------------------------------
  const juz = document.createElement("div");
  juz.className = "compass__juz";
  for (const part of corpus.fehres.juz) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "compass__cell";
    cell.textContent = eastern(part.n);
    cell.addEventListener("click", () => {
      context.onGoto(part.s, part.a);
      layer.close();
    });
    juz.appendChild(cell);
  }

  // --- the 604-page scrubber ----------------------------------------------
  const scrub = document.createElement("div");
  scrub.className = "compass__scrub";
  const readout = document.createElement("span");
  readout.className = "compass__readout";
  readout.textContent = eastern(context.page);
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "1";
  slider.max = "604";
  slider.step = "1";
  slider.value = String(context.page);
  slider.className = "compass__slider";
  slider.addEventListener("input", () => {
    readout.textContent = eastern(Number(slider.value));
  });
  slider.addEventListener("change", () => {
    context.onPage(Number(slider.value));
    layer.close();
  });
  scrub.append(readout, slider);

  // --- search by the letters themselves ------------------------------------
  const search = document.createElement("div");
  search.className = "compass__search";
  const field = document.createElement("input");
  field.type = "search";
  field.dir = "rtl";
  field.lang = "ar";
  field.className = "compass__field";
  field.autocomplete = "off";
  // No placeholder: a placeholder is a word, and §9 admits none.
  const results = document.createElement("div");
  results.className = "compass__results";
  search.append(field, results);

  let searching = 0;
  field.addEventListener("input", () => {
    window.clearTimeout(searching);
    searching = window.setTimeout(() => void runSearch(), 180);
  });

  async function runSearch(): Promise<void> {
    const query = field.value.trim();
    results.replaceChildren();
    if (query.length < 2) return;
    const index = await corpus.wordOccurrences();
    const forms = Object.keys(index).filter((form) => letterMatch(form, query));
    if (forms.length === 0) return; // stillness
    // The closest forms first: an exact folded match before a containment.
    forms.sort((a, b) => a.length - b.length || a.localeCompare(b, "ar"));
    const packed: number[] = [];
    for (const form of forms.slice(0, 40)) packed.push(...index[form]);
    packed.sort((a, b) => a - b);
    mountOccurrences(results, {
      packed: packed.slice(0, 400),
      rasm: context.rasm,
      onJump: (surah, ayah) => {
        context.onGoto(surah, ayah);
        layer.close();
      },
    });
  }

  // --- kept places ---------------------------------------------------------
  const kept = document.createElement("div");
  kept.className = "compass__kept";
  const saved = await keep.list();
  for (const entry of saved) {
    const line = document.createElement("button");
    line.type = "button";
    line.className = "compass__keep";
    line.dir = "rtl";
    line.appendChild(renderAyah(entry.surah, entry.ayah, { rasm: context.rasm, bare: true, limit: OPENING_WORDS }));
    line.addEventListener("click", () => {
      context.onGoto(entry.surah, entry.ayah);
      layer.close();
    });
    kept.appendChild(line);
  }

  layer.body.append(scrub, search, juz, surahs);
  if (saved.length) layer.body.appendChild(kept);
}
