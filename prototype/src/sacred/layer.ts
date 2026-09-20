/**
 * Layers, not screens (§8.5 / §9 "Architectures").
 *
 * Every research surface — word, root, path, addressed, field, compass,
 * compose — rises over the page and dismisses back to it. The page itself is
 * never unmounted and never scrolled by a layer, so ✕ always returns the
 * reader to the exact ayah and scroll position they left. Layers stack: a
 * root opened from a word dismisses back to the word, then to the page.
 */

import { DISMISS, RETRY } from "./glyphs";

export interface LayerHandle {
  root: HTMLElement;
  body: HTMLElement;
  rail: HTMLElement;
  close: () => void;
}

const stack: LayerHandle[] = [];

export function layerDepth(): number {
  return stack.length;
}

/** Dismiss the topmost layer. Returns false when the page is already bare. */
export function dismissTop(): boolean {
  const top = stack[stack.length - 1];
  if (!top) return false;
  top.close();
  return true;
}

export function dismissAll(): void {
  while (dismissTop()) {
    /* unwind to the page */
  }
}

export function openLayer(host: HTMLElement): LayerHandle {
  const root = document.createElement("div");
  root.className = "layer";
  root.dataset.depth = String(stack.length + 1);

  const rail = document.createElement("div");
  rail.className = "layer__rail";

  const body = document.createElement("div");
  body.className = "layer__body";

  const close = document.createElement("button");
  close.className = "mark mark--dismiss";
  close.type = "button";
  close.dataset.mark = "dismiss";
  close.textContent = DISMISS;

  root.append(rail, body, close);
  host.appendChild(root);

  const handle: LayerHandle = {
    root,
    body,
    rail,
    close: () => {
      const index = stack.indexOf(handle);
      if (index < 0) return;
      stack.splice(index, 1);
      root.dataset.leaving = "1";
      const done = () => root.remove();
      root.addEventListener("transitionend", done, { once: true });
      // A layer must always go away, and `transitionend` cannot be relied on:
      // under prefers-reduced-motion the duration is 0s and the event never
      // fires at all. The fallback is read from the element itself, so a
      // reader with motion turned off gets the node removed on the next frame
      // instead of waiting out a transition that is not happening.
      const declared = getComputedStyle(root).transitionDuration.split(",")[0].trim();
      const ms = declared.endsWith("ms") ? parseFloat(declared) : parseFloat(declared) * 1000;
      window.setTimeout(done, Number.isFinite(ms) && ms > 0 ? ms + 120 : 0);
    },
  };

  close.addEventListener("click", handle.close);
  stack.push(handle);
  // Let the browser paint the initial state before the rise begins.
  requestAnimationFrame(() => {
    root.dataset.open = "1";
  });
  return handle;
}

/** A shimmer stands in for loading. Nothing is announced in words. */
export function shimmer(host: HTMLElement): () => void {
  const node = document.createElement("div");
  node.className = "shimmer";
  node.append(document.createElement("i"), document.createElement("i"), document.createElement("i"));
  host.appendChild(node);
  return () => node.remove();
}

/** Failure is stillness, then ↻. */
export function stillness(host: HTMLElement, retry: () => void): void {
  host.replaceChildren();
  const node = document.createElement("button");
  node.className = "mark mark--retry";
  node.type = "button";
  node.dataset.mark = "retry";
  node.textContent = RETRY;
  node.addEventListener("click", () => {
    node.remove();
    retry();
  });
  host.appendChild(node);
}

/** Completion is a single breath. */
export function breathe(node: HTMLElement): void {
  node.dataset.breath = "1";
  window.setTimeout(() => delete node.dataset.breath, 700);
}
