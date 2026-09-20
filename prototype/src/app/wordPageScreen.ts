import { renderTopbar, el } from "./shell";
import { getRouter, goto } from "./routerInstance";
import { loadWordOccurrencesExact, loadSurahWords, lexiconWordByText } from "../data/loaders";
import { renderOccurrenceList } from "./occurrenceList";

const SHOW_TRANSLATION_KEY = "iq-show-translation";

/** §7.2 — the full word page: large Uthmani rendering, root/lemma/POS,
 * opt-in translation, every occurrence in the Quran as real ayah text. */
export async function wordPageScreen(params: Record<string, string>, container: HTMLElement): Promise<void> {
  const text = params.key;
  renderTopbar(container, getRouter(), "الكلمة");
  const body = el("div", "page-body");
  container.appendChild(body);

  const [occIndex, lex] = await Promise.all([loadWordOccurrencesExact(), lexiconWordByText(text)]);
  const loci = occIndex[text.normalize("NFC")] ?? [];

  const head = el("div");
  head.style.textAlign = "center";
  head.style.margin = "16px 0";
  const big = el("div");
  big.style.fontFamily = "var(--font-verse)";
  big.style.fontSize = "2.4rem";
  big.textContent = text;
  head.appendChild(big);
  body.appendChild(head);

  let root: string | null = null;
  let lemma: string | null = null;
  let posTag: string | null = null;
  if (loci[0]) {
    const [s, a, pos] = loci[0];
    const words = await loadSurahWords(s);
    const row = words.find((w) => w[0] === a && w[1] === pos);
    if (row) { root = row[3]; lemma = row[4]; posTag = row[5]; }
  }

  const badges = el("div");
  badges.style.display = "flex";
  badges.style.gap = "8px";
  badges.style.justifyContent = "center";
  badges.style.flexWrap = "wrap";
  badges.style.marginBottom = "14px";
  if (root) {
    const b = el("button", "list-row__badge hit-44");
    b.textContent = `الجذر: ${root}`;
    b.addEventListener("click", () => goto(`root/${encodeURIComponent(root!)}`));
    badges.appendChild(b);
  }
  if (lemma) { const b = el("span", "list-row__badge"); b.textContent = `اللِّيمة: ${lemma}`; badges.appendChild(b); }
  if (posTag) { const b = el("span", "list-row__badge"); b.textContent = posTag; badges.appendChild(b); }
  body.appendChild(badges);

  const toggle = el("label", "translation-toggle");
  toggle.style.justifyContent = "center";
  const cb = el("input", "", { type: "checkbox" }) as HTMLInputElement;
  cb.checked = (() => { try { return localStorage.getItem(SHOW_TRANSLATION_KEY) === "1"; } catch { return false; } })();
  const transRow = el("div");
  transRow.style.textAlign = "center";
  transRow.style.margin = "0 0 14px";
  transRow.hidden = !cb.checked;
  if (lex) transRow.innerHTML = `<div class="sheet__row" style="justify-content:center;gap:10px"><span>${lex[2]}</span><span style="color:var(--color-text-quiet)">${lex[3]}</span></div>`;
  cb.addEventListener("change", () => {
    try { localStorage.setItem(SHOW_TRANSLATION_KEY, cb.checked ? "1" : "0"); } catch { /* ignore */ }
    transRow.hidden = !cb.checked;
  });
  toggle.append(cb, document.createTextNode(" أظهر الترجمة والنطق (اختياري)"));
  body.appendChild(toggle);
  body.appendChild(transRow);

  renderOccurrenceList(body, loci, (n) => `${n} ورودًا بهذا الرسم بالذات في القرآن`);
}
