import { defineConfig } from "vite";

// Repo-relative source; served from the site root for local static preview
// (BUILD_PROMPT §5 "reproducible builds"). Public-dir assets (fonts, icons,
// manifest) use root-absolute paths, the standard Vite convention.
export default defineConfig({
  build: {
    target: "es2020",
    sourcemap: true,
  },
});
