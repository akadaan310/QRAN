import { el } from "./shell";
import { goto } from "./routerInstance";
import { loadQalamMarkers, loadWordOccurrences, loadWordToRoot, loadRootOccurrences } from "../data/loaders";
import { buildScreen } from "../data/screenBuilder";
import { mountCanvasScreen } from "./canvasHost";
import type { QalamMarker } from "../data/types";

const HARAKAT = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;
function normalize(s: string): string {
  return s.normalize("NFC").replace(HARAKAT, "").replace(/[آأإٱ]/g, "ا");
}

/**
 * §7.1 — a QALAM marker as an explorable scenario. The owner's proposed
 * reading is shown quoted and attributed, never as tafsīr; its loci are
 * derived live by word/root occurrence search on the marker's own anchor
 * terms (never invented), then walked through the same canvas engine as
 * the whole-Quran reader, 15 loci at a time.
 */
export async function qalamScreen(params: Record<string, string>, container: HTMLElement): Promise<() => void> {
  const n = Number(params.n);
  const offset = Math.max(0, Number(params.offset) || 0);

  const markers = await loadQalamMarkers();
  const marker = markers.find((m) => m.n === n);
  if (!marker) {
    container.innerHTML = "";
    const note = el("div", "empty-note");
    note.textContent = "لم تُوجد هذه العلامة.";
    container.appendChild(note);
    return () => {};
  }

  const loci = await deriveMarkerLoci(marker);
  const preface = renderPreface(marker, loci.length);
  container.appendChild(preface);

  const pageMount = el("div");
  container.appendChild(pageMount);

  if (loci.length === 0) {
    pageMount.appendChild(el("div", "empty-note")).textContent = "لم يُعثر على مواضع حيّة لألفاظ هذه العلامة في المصحف.";
    return () => {};
  }

  const slice = loci.slice(offset, offset + 15);
  const page = await buildScreen(`qalam-${n}-${offset}`, slice);
  return mountCanvasScreen(pageMount, page, {
    onPrev: offset > 0 ? () => goto(`qalam/${n}/${Math.max(0, offset - 15)}`) : undefined,
    onNext: offset + 15 < loci.length ? () => goto(`qalam/${n}/${offset + 15}`) : undefined,
    locusText: `مشهد القلم ${n} — ${offset + 1}–${Math.min(offset + 15, loci.length)} من ${loci.length}`,
    homePath: "experiences",
  });
}

function renderPreface(marker: QalamMarker, count: number): HTMLElement {
  const wrap = el("div");
  wrap.style.padding = "calc(var(--safe-t) + 14px) 16px 10px";
  wrap.style.background = "var(--color-panel)";
  wrap.style.borderBottom = "1px solid var(--color-line)";
  wrap.innerHTML = `
    <div style="font-family:var(--font-heading);font-size:1rem;color:var(--color-accent);margin-bottom:6px">${marker.n}. ${marker.title_en}</div>
    <div style="font-size:13px;line-height:1.8;color:var(--color-text)">${marker.text}</div>
    <div style="font-family:var(--font-apparatus);font-size:11px;color:var(--color-text-quiet);margin-top:8px">
      قراءة مقترحة من صاحب المشروع (QALAM) — ليست تفسيرًا ولا قراءة معتمدة. ${count} موضعًا مُشتقًّا حيًّا.
    </div>`;
  return wrap;
}

async function deriveMarkerLoci(marker: QalamMarker): Promise<{ surah: number; ayah: number }[]> {
  const terms = [...new Set([...marker.anchor_words, ...marker.trailing_arabic_terms])].filter((w) => w.length >= 2);
  const [wordOcc, wordToRoot, rootOcc] = await Promise.all([loadWordOccurrences(), loadWordToRoot(), loadRootOccurrences()]);

  const seen = new Set<string>();
  const loci: { surah: number; ayah: number }[] = [];
  const push = (s: number, a: number) => {
    const key = `${s}:${a}`;
    if (seen.has(key)) return;
    seen.add(key);
    loci.push({ surah: s, ayah: a });
  };

  for (const term of terms) {
    const norm = normalize(term);
    for (const [s, a] of wordOcc[norm] ?? []) push(s, a);
    const root = wordToRoot[norm];
    if (root) for (const [s, a] of rootOcc[root] ?? []) push(s, a);
  }

  loci.sort((a, b) => a.surah - b.surah || a.ayah - b.ayah);
  return loci.slice(0, 200); // a generous but bounded field, not an unfiltered flood
}
