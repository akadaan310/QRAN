import { renderTopbar, el } from "./shell";
import { getRouter } from "./routerInstance";
import { loadRoots, loadRootOccurrences } from "../data/loaders";
import { renderOccurrenceList } from "./occurrenceList";

/** §7.2 — the root page: gloss, book-attributed classical definitions,
 * masadir, every occurrence across the Quran (any form of the root). */
export async function rootPageScreen(params: Record<string, string>, container: HTMLElement): Promise<void> {
  const root = params.root;
  renderTopbar(container, getRouter(), "الجذر");
  const body = el("div", "page-body");
  container.appendChild(body);

  const [roots, occIndex] = await Promise.all([loadRoots(), loadRootOccurrences()]);
  const entry = roots[root];
  const loci = occIndex[root] ?? [];

  const head = el("div");
  head.style.textAlign = "center";
  head.style.margin = "16px 0";
  const big = el("div");
  big.style.fontFamily = "var(--font-verse)";
  big.style.fontSize = "2.6rem";
  big.textContent = root;
  head.appendChild(big);
  body.appendChild(head);

  if (entry) {
    const glossWrap = el("div");
    glossWrap.style.textAlign = "center";
    glossWrap.style.marginBottom = "14px";
    glossWrap.innerHTML = `
      <div style="font-size:15px;line-height:1.8">${entry.g_ar}</div>
      <div class="list-row__meta" style="margin-top:4px">${entry.g_ar_src}</div>`;
    body.appendChild(glossWrap);

    if (entry.masadir.length) {
      const m = el("div");
      m.style.textAlign = "center";
      m.style.marginBottom = "14px";
      m.innerHTML = `<span class="list-row__meta">المصادر: </span>` + entry.masadir.map((x) => `<span class="list-row__badge" style="margin-inline:2px">${x.m}</span>`).join("");
      body.appendChild(m);
    }

    if (entry.defs.length) {
      const defsTitle = el("div", "list-row__meta");
      defsTitle.style.margin = "12px 2px 6px";
      defsTitle.textContent = `${entry.defs.length} تعريفًا من المعاجم الكلاسيكية`;
      body.appendChild(defsTitle);
      for (const d of entry.defs) {
        const box = el("div", "classical-def");
        box.innerHTML = `<div class="classical-def__book">${d.book}</div><div class="classical-def__text" dir="rtl">${d.text}</div>`;
        body.appendChild(box);
      }
    }
  } else {
    body.appendChild(el("div", "empty-note")).textContent = "لا مُدخل معجمي لهذا الجذر في المصدر المتاح.";
  }

  renderOccurrenceList(body, loci, (n) => `${n} ورودًا لهذا الجذر في القرآن`);
}
