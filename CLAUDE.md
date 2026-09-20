# CLAUDE.md — Interstellar Quran, session brief

You are working inside the **session workspace** for the Interstellar Quran web app.
Read this file first, then `docs/PHASE-01-UI-SYSTEM.md`, `docs/ARCHITECTURE.md`,
`docs/REFERENCES.md`. The reference projects live under `references/` (read-only
material — never edit them in place; vendor what you need).

## Mission

A **public-facing Interstellar Quran web app**: thousands of immersive
Qur'anic experiences on the open web — the entire Quran rendered in full,
navigable end to end, with complete lexicons and a dynamic فهرس.

**Standing order from the owner (2026-09-20): NO APPROVALS. JUST BUILD AND
PROSPER.** The Phase-1 approval gate is revoked. The standing execution order
is **`FINALITY_PROMPT.md`** — execute it end to end, verify everything
yourself, commit, and push. Do not stop for approval at any stage.

## The covenant (distilled from the reference projects)

Non-negotiable across every phase:

1. **Citational walks.** Every step of a journey is a *citation*, never an
   invention. Paths are built from morphology, roots, formulas, attested
   sequences — never generated prose between verses.
2. **Arabic-first.** No translations anywhere in the UI. By design.
3. **Apparatus in the margin, never in the line.** Verse text renders pure;
   citations, weights, labels live in the margin / overlay. Nothing human-made
   stands between one verse and the next but the text itself.
4. **Measurement honesty.** Label guesses as guesses. Keep failed experiments
   visible. A heuristic that didn't work is a finding, not a bug to hide.
   If the morphology doesn't say it, you don't claim it.
5. **100s of experiences means a data-driven registry, not hand pages.**
   One shell, many journeys. Every experience is data: a JSON record in a
   registry, rendered by one engine. If it can't be a registry entry, it
   doesn't ship.

## What to steal from each reference

- **`references/isnaad`** (Isnād Studio, Next.js): the eight structural
  detectors and the *acceptance-test discipline* — passages pinned as tests
  (`npm run verify`), so a change that stops finding them is wrong. Steal the
  composer pacing rule: *construct, then what the tongue does with it*. Steal
  the honest-negative register (guesses labeled مستنبَط, the bug diary).
- **`references/mirtal`** (public al-Mirtāl repo): the formal planner layer —
  citation-sequence ops (carry, stitch, reverse, compress, enclose, union,
  gated omission), information-weighted edges (`w = −log₂(targets/corpus)`),
  Furqān planner (ابتداء → تفريق → توسّع → رجوع, closed by return to anchor).
  Note: this is the *reverted* edition; the ن lock and discovery ledger were
  removed on Sep 18.
- **`references/mirtal-bundle`** (the git bundle, HEAD newer than the public
  repo): contains the **reverted features** — the ن capability-lock system
  (agent-drivable surface: `window.mirtal.lock/walk/field/state/text`) and the
  الكَشْف discovery ledger (KNOWN / DERIVED / INVALID / WITHHELD / UNEXPLORED
  per coordinate). Treat these as *reference ideas*, not as code to ship:
  the owner deliberately revoked them from the public record.
- **`references/sayyarah/index.html`** (the Sayyarah proposal, a single static
  doc): the **24 verb-named operations** (each named from a Qur'anic verb with
  a witness verse), the **four refusals** (no counting, no naming/classification,
  no translation substitution, no tafsīr), and the Hermes LLM interface rule:
  the model is asked only *"صِفْ ما وقفتَ عليه"* — describe what you stand on;
  citations matched against the rasm, descriptions preserved unverified.

## Conventions

- **Repo-relative paths only.** Never `/home/...`, never `/tmp/...`, never
  machine-specific paths. The previous projects broke on exactly this.
- **Vendored data.** Corpus and generated indices are committed under
  `data/`; no network, no database needed for a fresh clone to build.
- **Reproducible builds.** `npm run build` output must be byte-identical to
  what's checked in; a CI check should enforce this.
- **Derived artifacts regenerate from source.** Never hand-edit generated
  JSON/HTML; fix the generator and rebuild.
- **Commits are literature.** Write commit messages worth reading.

## Working rules

- `FINALITY_PROMPT.md` is the standing execution order. Execute it fully:
  full-Quran canvas, experiences browser, lexicons, فهرس, language-agnostic
  pass, verification, commit, push. No approval stops.
  - §7 "The infinite layer" (2026-09-20): 30 QALAM markers as scenario
    engines (quoted, attributed — never tafsir), full word pages, corpus-derived
    archetype addressees, generative (non-finite) experiences, render-time
    dotless-rasm display.
  - §8 "The reader is the app" (2026-09-20): the card-and-chip prototype look
    is rejected. The Quran page is the interface; every research layer is
    reached from the text by gesture as overlays — no taxonomy screens, no
    filter bars, no Latin transliteration chips, no invented vocabulary
    user-visible. The فهرس is a one-gesture compass. Rule of done: if a feature
    cannot be reached from the text by gesture, it is not done.
  - §9 "The sacred interface" (2026-09-20, FINAL): the only words on screen
    are Quranic Arabic — no UI labels in any language, no Arabic UI vocabulary
    either, no Latin, no translations, no definition prose. Interface is
    Quranic text + eight sacred glyphs (✦ ❖ ◈ ◉ ⬔ ◐ ◍ ✧) + gestures + space +
    motion, learned in a wordless first-run lesson. Wordless audit required:
    every rendered token must occur in the canonical corpus.
- `BUILD_PROMPT.md` is superseded (kept for history).
- Extend `prototype/` — never rewrite it wholesale; keep every passing
  behavior passing.
- The data layer under `data/` is canonical and regenerated only via
  `scripts/build-data/` (never hand-edit generated JSON).
- Ask before spending money, signing up for services, or changing anything
  outside this repo.
