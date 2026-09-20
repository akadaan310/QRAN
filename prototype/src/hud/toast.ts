/**
 * Rail narration — HUD taxonomy rule 2: "the HUD narrates, never
 * interrupts... no popups, no banners, no modal dialogs." This is a
 * non-blocking, auto-dismissing pill anchored to the top rail, used for
 * refusals (US-5.1) and brief state narration (lock engage/release).
 */
export class ToastRail {
  private el: HTMLElement;
  constructor(mount: HTMLElement) {
    this.el = document.createElement("div");
    this.el.className = "toast-rail";
    this.el.setAttribute("aria-live", "polite");
    mount.appendChild(this.el);
  }

  show(message: string, kind?: "refuse"): void {
    const t = document.createElement("div");
    t.className = kind === "refuse" ? "toast toast--refuse reveal" : "toast reveal";
    t.textContent = message;
    this.el.appendChild(t);
    window.setTimeout(() => {
      t.style.opacity = "0";
      t.style.transition = "opacity 220ms linear";
      window.setTimeout(() => t.remove(), 240);
    }, 2200);
  }
}
