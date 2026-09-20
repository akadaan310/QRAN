import { el } from "./shell";
import { goto } from "./routerInstance";
import { loadVocatives } from "../data/loaders";
import { buildScreen } from "../data/screenBuilder";
import { mountCanvasScreen } from "./canvasHost";

/**
 * §7.3 — an archetype addressee journey. The vocative phrase itself is the
 * title, quoted verbatim from the corpus (no invented names, no
 * backstories); entering it walks every ayah carrying that address, in
 * mushaf order, through the same canvas engine, 15 at a time.
 */
export async function archetypeScreen(params: Record<string, string>, container: HTMLElement): Promise<() => void> {
  const key = params.key;
  const offset = Math.max(0, Number(params.offset) || 0);

  const vocatives = await loadVocatives();
  const entry = vocatives.find((v) => v.key === key);
  if (!entry) {
    const note = el("div", "empty-note");
    note.textContent = "لم يُوجد هذا النداء.";
    container.appendChild(note);
    return () => {};
  }

  const preface = el("div");
  preface.style.padding = "calc(var(--safe-t) + 14px) 16px 10px";
  preface.style.background = "var(--color-panel)";
  preface.style.borderBottom = "1px solid var(--color-line)";
  preface.innerHTML = `
    <div style="font-family:var(--font-verse);font-size:1.5rem;text-align:center;margin-bottom:8px" dir="rtl">${entry.display}</div>
    <div style="font-family:var(--font-apparatus);font-size:11px;color:var(--color-text-quiet);text-align:center">
      نداءٌ مُشتقٌّ من النصّ نفسه — ${entry.count} موضعًا. ادخل هذا النداء لتسير عبره آيةً آية.
    </div>`;
  container.appendChild(preface);

  const pageMount = el("div");
  container.appendChild(pageMount);

  const loci = entry.loci.map(([surah, ayah]) => ({ surah, ayah }));
  const slice = loci.slice(offset, offset + 15);
  const page = await buildScreen(`archetype-${key}-${offset}`, slice);
  return mountCanvasScreen(pageMount, page, {
    onPrev: offset > 0 ? () => goto(`archetype/${encodeURIComponent(key)}/${Math.max(0, offset - 15)}`) : undefined,
    onNext: offset + 15 < loci.length ? () => goto(`archetype/${encodeURIComponent(key)}/${offset + 15}`) : undefined,
    locusText: `${offset + 1}–${Math.min(offset + 15, loci.length)} من ${loci.length}`,
    homePath: "experiences",
  });
}
