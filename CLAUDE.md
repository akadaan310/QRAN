# CLAUDE.md — Interstellar Quran, session brief

You are working inside the **session workspace** for the Interstellar Quran web app.
Read this file first, then `docs/PHASE-01-UI-SYSTEM.md`, `docs/ARCHITECTURE.md`,
`docs/REFERENCES.md`. The reference projects live under `references/` (read-only
material — never edit them in place; vendor what you need).

## Mission

A **public-facing Interstellar Quran web app**: hundreds of immersive Qur'anic
experiences on the open web.

**Phase 1 (current): design the Immersion UI System and get it approved.**
No experience-building until the owner signs off on the UI system.
Phase 1 output = a written UI-system proposal + an interactive prototype that
demonstrates the system on a small set of sample experiences. That prototype is
the approval gate.

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

- Phase 1 delivers the UI system proposal + interactive prototype. Nothing
  else. Do not start building experiences, importing the full corpus, or
  wiring deployment beyond the prototype's needs.
- The approval gate: the owner reviews the prototype and says "approved"
  (explicitly, in chat). Until then: iterate on the system.
- When the owner approves, the next phase begins — do not pre-build phase 2.
- Ask before spending money, signing up for services, or changing anything
  outside `~/workspace/interstellar-quran/`.
