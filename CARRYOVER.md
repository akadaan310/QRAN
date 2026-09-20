# Session Carryover — read this first, then CLAUDE.md

Written 2026-09-20 at the close of the session that produced `spec-computational-ui/`.
Purpose: let a fresh Claude Code session pick up this repo cold, with no prior
conversation, and know exactly what exists, what's verified, and what's open.
Read this, then `CLAUDE.md` (which is the live standing order and supersedes
anything here if the two ever disagree), then `FINALITY_PROMPT.md`.

## Standing order (still in effect)

CLAUDE.md carries the owner's 2026-09-20 order: **"NO APPROVALS. JUST BUILD
AND PROSPER."** The Phase-1 approval gate described in `docs/PHASE-01-UI-SYSTEM.md`
§5 is revoked. Do not wait for sign-off before building, committing, or
pushing. `FINALITY_PROMPT.md` is the standing execution order for the app
itself; its §9 ("The sacred interface") is the current final word on what the
reading UI may show.

## What exists and is verified, in build order

1. **Phase 1 prototype** (`prototype/`) — 15-lane canvas engine, gesture
   dictionary, governor, three fixture sample pages. Fully built and
   Playwright-verified. Record: `prototype/QA_NOTES.md`, `docs/PHASE-01-UI-SYSTEM.md` §§1-6.

2. **Full build on FINALITY_PROMPT.md** (`prototype/` extended, `data/`
   populated) — real Quran text/lexicon/morphology vendored under `data/`
   (see `data/SOURCES.md` for full provenance/license accounting: Quran.com
   API CC-BY-4.0, Quranic Arabic Corpus v0.4 GPL, Hawramani Lexicon
   GPL-3.0). Reader screens, word/root pages, فهرس, 30 QALAM markers,
   vocative-archetype journeys, rasm toggle all built and wired through the
   same canvas engine (`buildScreen()` → `PageFixture`, never a second
   engine). Full record and every documented reduction/deviation:
   `prototype/QA_NOTES.md` "FINALITY_PROMPT" section, `docs/PHASE-01-UI-SYSTEM.md`
   §7.

   **Known gap, not yet fixed:** this app was built against CLAUDE.md's
   earlier §8 ("the reader is the app," Arabic UI vocabulary still
   permitted). §9 landed on `origin/main` (commit `e920d6c`) *during* the
   next phase of work and raises the bar to zero words of any kind — only
   pure Quranic Arabic text plus eight sacred glyphs (✦ ❖ ◈ ◉ ⬔ ◐ ◍ ✧), no
   Arabic UI labels either. **The built app in `prototype/` still shows
   Arabic UI strings** (tab names, toast messages, screen headers like
   "الفهرس", "السور", "الجذور", lens-code chips, etc.) and has not been
   retrofitted to §9's law. This is real, un-fixed technical debt, not a
   design uncertainty — the fix is mechanical (strip every UI string,
   replace with the sacred-glyph canon and gesture-only affordances per the
   spec below) but has not been started.

3. **`spec-computational-ui/`** (this session, complete) — a pure design
   specification, not app code, for a *next-generation* rendering of the
   same canvas that would actually satisfy §9. Four files, each with an
   exactly-three-sentence Overview and zero code snippets, cross-referencing
   each other and the five global nomenclature terms from
   `curriculum-wiki-matrix/00_unified_nomenclature/NOMENCLATURE.md`
   (Substrate Array, Attribution Vectors, Rigidity Coefficient, System
   Invariants, Locus Coordinates):
   - `00_canvas_bounds.md` — the borderless 15-lane rectangle, seams,
     margin-void channels, equilibrium math, depth axis.
   - `01_typographic_physics.md` — weight-as-claim, elastic typographic
     tension (Rigidity Coefficient → word spacing), dynamic depth of field
     (Attribution Vectors → z-axis scale/sharpness/recession), lane
     expansion, invariant harmonics (the closure shimmer).
   - `02_telemetry_hud_rails.md` — the two margin channels, tick taxonomy
     (no printed digits anywhere), anchor-dot touch proximity, the sacred
     glyph canon as the *only* tappable rail marks, locus without numerals,
     the non-covering law (rails never draw over text).
   - `03_tactile_interaction.md` — locus gestures vs. geometry gestures as
     two independent families, the full gesture-to-effect dictionary
     (table), multi-speed velocity input as continuous (not stepped)
     interpolation between flat/deep-vertical/orbital geometries, trace
     locks (forward motion halted until exact gesture reversal, no
     timeout), and the dismissal/reversibility law (every mode exits by
     the reverse of its own entry gesture, never a separate close control).

   This spec set is the design answer to a request to architect a
   zero-jargon interface with all research telemetry (Attribution Vectors,
   Rigidity Coefficient, layer-closure validation, Structural Cross-Planes)
   expressed purely as typographic/geometric physics rather than labels.
   **It has not yet been implemented against `prototype/`.**

## Immediate open items for the next session

1. **Verify `spec-computational-ui/` internally** before treating it as
   settled: re-read all four files together for nomenclature consistency,
   confirm each Overview is still exactly three sentences after any future
   edit, confirm no code snippets crept in, confirm cross-file references
   (`00_canvas_bounds.md` ↔ `01_...md` ↔ `02_...md` ↔ `03_...md`) all
   resolve to real section names in the target file.
2. **Decide whether to implement the spec against `prototype/`, or treat it
   as a forward-looking design document only**, and if implementing, treat
   it as the mechanism that finally closes the §9 gap above — the spec's
   glyph-only rails and word/root depth layers are designed to *replace*
   the app's current Arabic-labeled tabs and screens, not sit beside them.
3. If asked to close the §9 gap directly without full spec implementation:
   the minimum fix is stripping every non-Quranic, non-glyph string
   currently rendered in `prototype/src/app/*.ts` and `prototype/src/styles/app.css`,
   replacing navigation with the eight-glyph canon plus gesture-only
   affordances, and adding the wordless first-run lesson + wordless audit
   both required by CLAUDE.md §9. Do not attempt this piecemeal without
   re-reading §9's full text in `CLAUDE.md` first — it is stated as final
   and absolute, not incremental.
4. Before any further push: `git fetch origin main` and
   `git fetch origin claude/new-session-a43zwi` first — mid-session surprises
   from the owner landing directly on `origin/main` have happened twice
   already this project (§9 itself arrived this way, requiring a merge
   mid-task).

## Conventions this repo already established (don't relitigate)

- Repo-relative paths only, everywhere, including in specs and scripts.
- Never hand-edit anything under `data/` or `prototype/public/data/` —
  regenerate via `prototype/scripts/build-*.mjs` / `sync-data.mjs`, fix the
  generator if the output is wrong.
- Every simplification, reduction, or heuristic gets documented at the
  point it's made (`prototype/QA_NOTES.md`, `data/SOURCES.md`, or inline
  script comments) — never silently smoothed over. This includes small
  known variances (e.g. the 21287-vs-21295 word-form count noted in
  `data/SOURCES.md` §4).
- `prototype/` is extended, never rewritten wholesale; every previously
  passing Playwright-verified behavior must still pass after a change.
- Commit messages are written as literature (per CLAUDE.md's "commits are
  literature" rule) — full sentences explaining the *why*, not changelog
  fragments.
- This session's git identity: branch `claude/new-session-a43zwi`, tracking
  both that branch and `main` on `origin` (GitHub: `akadaan310/QRAN`). Merge
  conflicts so far have all been resolved by keeping the superset content
  (e.g. `data/SOURCES.md`'s §4 was a strict addition, not a real conflict).
