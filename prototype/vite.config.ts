import { cpSync, existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

// The canonical corpus lives at the repo root in `data/` (CLAUDE.md: the data
// layer under `data/` is canonical). It is deliberately NOT copied into
// `prototype/public/` — a second committed copy would be a derived artifact
// living next to its own source, exactly what "never hand-edit generated
// JSON" exists to prevent. Instead this plugin serves it at `/data/…` during
// `vite dev` and copies it into `dist/data/` at build time, so a static
// `dist/` is self-contained and a fresh clone needs no network.
const DATA_DIR = path.resolve(__dirname, "../data");

const MIME: Record<string, string> = { ".json": "application/json; charset=utf-8", ".md": "text/markdown; charset=utf-8" };

function corpus(): Plugin {
  return {
    name: "qran-corpus",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? "").split("?")[0];
        if (!url.startsWith("/data/")) return next();
        // Path traversal guard: resolve, then require containment.
        const target = path.resolve(DATA_DIR, decodeURIComponent(url.slice("/data/".length)));
        if (!target.startsWith(DATA_DIR + path.sep) || !existsSync(target) || !statSync(target).isFile()) {
          res.statusCode = 404;
          return res.end();
        }
        res.setHeader("Content-Type", MIME[path.extname(target)] ?? "application/octet-stream");
        return res.end(readFileSync(target));
      });
    },
    closeBundle() {
      const out = path.resolve(__dirname, "dist/data");
      cpSync(DATA_DIR, out, { recursive: true });
    },
  };
}

export default defineConfig({
  plugins: [corpus()],
  build: {
    target: "es2020",
    sourcemap: true,
  },
});
