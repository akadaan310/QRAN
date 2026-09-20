/**
 * A small hash router — no framework, matching the rest of this codebase's
 * "vanilla DOM" convention (BUILD_PROMPT §5). Routes are plain path
 * templates like "read/:idx"; params come back as strings.
 */
export type RouteHandler = (
  params: Record<string, string>,
  container: HTMLElement,
) => void | (() => void) | Promise<void | (() => void)>;

interface Route {
  pattern: RegExp;
  keys: string[];
  handler: RouteHandler;
}

export class Router {
  private routes: Route[] = [];
  private cleanup: (() => void) | null = null;
  private resolveToken = 0;

  constructor(private container: HTMLElement) {
    window.addEventListener("hashchange", () => this.resolve());
  }

  on(path: string, handler: RouteHandler): this {
    const keys: string[] = [];
    const pattern = new RegExp(
      "^" + path.replace(/:([A-Za-z0-9_]+)/g, (_, k) => { keys.push(k); return "([^/]+)"; }) + "$",
    );
    this.routes.push({ pattern, keys, handler });
    return this;
  }

  start(): void {
    this.resolve();
  }

  navigate(path: string): void {
    if (location.hash.replace(/^#\/?/, "") === path) { this.resolve(); return; }
    location.hash = `/${path}`;
  }

  private resolve(): void {
    const path = location.hash.replace(/^#\/?/, "") || "";
    if (this.cleanup) { this.cleanup(); this.cleanup = null; }
    for (const route of this.routes) {
      const m = route.pattern.exec(path);
      if (!m) continue;
      const params: Record<string, string> = {};
      route.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      this.container.innerHTML = "";
      const token = ++this.resolveToken;
      const ret = route.handler(params, this.container);
      // Handlers may be async (most fetch data before they can render).
      // If another navigation starts before this one resolves, its
      // cleanup — if any — runs immediately instead of clobbering the
      // screen that has since replaced it.
      Promise.resolve(ret).then((resolved) => {
        if (typeof resolved !== "function") return;
        if (token === this.resolveToken) this.cleanup = resolved;
        else resolved();
      });
      window.scrollTo(0, 0);
      return;
    }
    // no match: fall back to home
    if (path !== "") this.navigate("");
  }
}
