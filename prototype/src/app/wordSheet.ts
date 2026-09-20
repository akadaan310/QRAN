import { el } from "./shell";
import { goto } from "./routerInstance";
import { lexiconWordByText } from "../data/loaders";

const SHOW_TRANSLATION_KEY = "iq-show-translation";

function translationEnabled(): boolean {
  try { return localStorage.getItem(SHOW_TRANSLATION_KEY) === "1"; } catch { return false; }
}

/**
 * §7.2 word card — the quick-glance sheet a plain tap on any word opens.
 * Arabic-first: translation/transliteration sit behind an opt-in toggle,
 * never shown by default (CLAUDE.md covenant §2, FINALITY_PROMPT §5).
 */
export async function openWordSheet(mount: HTMLElement, marked: string, root: string | null): Promise<void> {
  const existing = mount.querySelector(".sheet[data-kind='word']");
  if (existing) existing.remove();

  const sheet = el("div", "sheet", { "data-kind": "word" });
  sheet.innerHTML = `<div class="sheet__grip"></div><div class="sheet__word">${marked}</div>`;
  mount.appendChild(sheet);

  const lex = await lexiconWordByText(marked);
  const showTranslation = translationEnabled();

  const rows = el("div");
  if (root) {
    const r = el("div", "sheet__row");
    r.innerHTML = `<span>الجذر</span><span>${root}</span>`;
    rows.appendChild(r);
  }
  if (lex) {
    const countRow = el("div", "sheet__row");
    countRow.innerHTML = `<span>عدد الورود بهذا الرسم</span><span>${lex[4]}</span>`;
    rows.appendChild(countRow);
    if (showTranslation) {
      const en = el("div", "sheet__row");
      en.innerHTML = `<span>English</span><span>${lex[2]}</span>`;
      rows.appendChild(en);
      const tr = el("div", "sheet__row");
      tr.innerHTML = `<span>Transliteration</span><span>${lex[3]}</span>`;
      rows.appendChild(tr);
    }
  }
  sheet.appendChild(rows);

  const toggle = el("label", "translation-toggle");
  const cb = el("input", "", { type: "checkbox" }) as HTMLInputElement;
  cb.checked = showTranslation;
  cb.addEventListener("change", () => {
    try { localStorage.setItem(SHOW_TRANSLATION_KEY, cb.checked ? "1" : "0"); } catch { /* ignore */ }
    void openWordSheet(mount, marked, root);
  });
  toggle.append(cb, document.createTextNode(" أظهر الترجمة والنطق (اختياري)"));
  sheet.appendChild(toggle);

  const actions = el("div", "sheet__actions");
  const wordPageBtn = el("button", "sheet__btn hit-44");
  wordPageBtn.textContent = "صفحة الكلمة الكاملة";
  wordPageBtn.addEventListener("click", () => { sheet.dataset.open = "0"; goto(`word/${encodeURIComponent(marked)}`); });
  actions.appendChild(wordPageBtn);
  if (root) {
    const rootPageBtn = el("button", "sheet__btn hit-44");
    rootPageBtn.textContent = "صفحة الجذر";
    rootPageBtn.addEventListener("click", () => { sheet.dataset.open = "0"; goto(`root/${encodeURIComponent(root)}`); });
    actions.appendChild(rootPageBtn);
  }
  sheet.appendChild(actions);

  sheet.addEventListener("click", (e) => {
    if (e.target === sheet) sheet.dataset.open = "0";
  });

  requestAnimationFrame(() => { sheet.dataset.open = "1"; });
}
