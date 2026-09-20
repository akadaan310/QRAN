import { renderTopbar, el } from "./shell";
import { getRouter, goto } from "./routerInstance";
import { loadExperiences, ayahByLocus, surahByNumber } from "../data/loaders";
import { screenStartForLocus } from "../data/nav";
import { CAT_LABELS } from "./experiencesScreen";

/** Phase D — a single experience's page: title, its note (verbatim, quoted
 * from isnaad), and every locus rendered as real ayah text (never copied
 * prose), one tap from the canvas. */
export async function experienceScreen(params: Record<string, string>, container: HTMLElement): Promise<void> {
  renderTopbar(container, getRouter(), "تجربة");
  const body = el("div", "page-body");
  container.appendChild(body);

  const experiences = await loadExperiences();
  const exp = experiences.find((e) => e.id === params.id);
  if (!exp) { body.appendChild(el("div", "empty-note")).textContent = "لم تُوجد هذه التجربة."; return; }

  const head = el("div");
  head.innerHTML = `<div class="list-row__main" style="font-size:1.3rem;margin-bottom:6px">${exp.title}</div>
    <div class="list-row__meta">${exp.kind === "discovery" ? (CAT_LABELS[exp.cat] ?? exp.cat) : exp.kind === "motif" ? `نمط: ${exp.pattern ?? ""}` : `${exp.n_words ?? ""} كلمات متكررة`} · ${exp.loci.length} موضعًا</div>`;
  body.appendChild(head);

  if (exp.note) {
    const note = el("div", "exp-card__note");
    note.style.margin = "14px 0";
    note.textContent = exp.note;
    body.appendChild(note);
  }
  if (exp.roots?.length) {
    const roots = el("div");
    roots.style.margin = "10px 0";
    roots.innerHTML = `<span class="list-row__meta">جذور مرتبطة: </span>` + exp.roots.map((r) => `<button class="list-row__badge hit-44" data-root="${r}" style="margin-inline:2px">${r}</button>`).join("");
    roots.querySelectorAll<HTMLElement>("[data-root]").forEach((b) => b.addEventListener("click", () => goto(`root/${encodeURIComponent(b.dataset.root!)}`)));
    body.appendChild(roots);
  }

  const listTitle = el("div", "list-row__meta");
  listTitle.style.margin = "16px 2px 6px";
  listTitle.textContent = "المواضع";
  body.appendChild(listTitle);

  for (const locus of exp.loci) {
    body.appendChild(await renderLocusCard(locus));
  }
}

async function renderLocusCard(locus: number[]): Promise<HTMLElement> {
  const [surah, from, to] = locus;
  const ayahTo = to ?? from;
  const surahMeta = await surahByNumber(surah);
  const card = el("div", "occurrence-row hit-44", { role: "button", tabindex: "0" });
  const parts: string[] = [];
  for (let a = from; a <= Math.min(ayahTo, from + 20); a++) {
    const row = await ayahByLocus(surah, a);
    if (row) parts.push(row[9]);
  }
  card.innerHTML = `<div class="occurrence-row__locus">${surahMeta?.ar ?? surah} ${from}${ayahTo !== from ? `–${ayahTo}` : ""}</div><div class="occurrence-row__text" dir="rtl">${parts.join(" ")}</div>`;
  card.addEventListener("click", async () => goto(`read/${await screenStartForLocus(surah, from)}`));
  return card;
}
