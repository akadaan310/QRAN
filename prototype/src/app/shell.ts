import type { Router } from "./router";

/** Shared topbar: back, title, home. Every non-reader screen gets one. */
export function renderTopbar(container: HTMLElement, router: Router, title: string, opts: { back?: boolean } = { back: true }): HTMLElement {
  const bar = document.createElement("div");
  bar.className = "topbar";
  if (opts.back !== false) {
    const back = document.createElement("button");
    back.className = "topbar__back hit-44";
    back.textContent = "→"; // RTL: forward-pointing = back in reading direction
    back.setAttribute("aria-label", "رجوع");
    back.addEventListener("click", () => history.length > 1 ? history.back() : router.navigate(""));
    bar.appendChild(back);
  }
  const h = document.createElement("div");
  h.className = "topbar__title";
  h.textContent = title;
  bar.appendChild(h);
  const home = document.createElement("button");
  home.className = "topbar__home hit-44";
  home.textContent = "⌂";
  home.setAttribute("aria-label", "الفهرس");
  home.addEventListener("click", () => router.navigate(""));
  bar.appendChild(home);
  container.appendChild(bar);
  return bar;
}

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, attrs?: Record<string, string>): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (attrs) for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}
