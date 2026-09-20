# Architecture — Interstellar Quran (target, post Phase 1)

Pragmatic sketch of where the project goes *after* the UI system is approved.
Do not build any of this in Phase 1.

## The core bet

**One shell, many journeys.** Hundreds of experiences are data, not pages.
An experience = a JSON record in a registry; the rendering engine + the
approved UI system turn records into journeys. Adding experience #200 must be
a data PR, never a code PR.

## Experience registry schema (draft)

```jsonc
{
  "id": "rum-30-tarteel",
  "title": "…",                 // Arabic only
  "type": "station-walk",       // from the catalog below
  "seed": { "surah": 30, "ayah": 1 },
  "stations": [                 // citations; engine may also derive them
    { "locus": "30:1", "cause": "ibtidāʾ" },
    { "locus": "30:2", "cause": "tajāwur", "weight": 2.0, "type": "naṣṣī" }
  ],
  "planner": "furqan",          // or null when stations are hand-authored
  "plannerParams": { "depth": 3 },
  "controls": ["burūj", "mawāqiʿ", "falak", "sirāj", "qamar"],
  "entry": "istiadha",          // entry plate variant
  "provenance": {               // honesty machinery
    "generatedBy": "generate.py v…",
    "corpus": "qac-0.4+tanzil",
    "verifiedAgainst": ["verify:rum-30"]
  }
}
```

Every registry entry carries its provenance and its verification. No
experience ships without both.

## Corpus layer

Vendored under `data/`: Uthmani text + QAC morphology (committed once, with
source URLs + SHA pins in `data/SOURCES.md`), plus generated indices
(per-āyah vectors, roots, motifs, per-word informational edges). Raw sources
and derived indices are separate directories; the build regenerates indices
from raw and fails loudly on mismatch. Derived artifacts regenerate from
source; never hand-edit them.

## Rendering engine

One static shell (the approved UI system): starfield, station renderer,
journey rail, construct-named controls, margin apparatus, entry plate.
Experiences are fetched as registry JSON and rendered at view time — like
isnaad's الفرقان, the controls operate on the *text*, not on a timeline.
No per-experience code; new experience types extend the catalog, not the
shell.

## Experience types catalog (initial)

1. **station-walk** — a citational path through the muṣḥaf, closed by return
   to anchor (mirtal's ترتيل).
2. **motif-constellation** — repeated isnād/word contours placed as a star map
   (isnaad's المثاني + cosmos).
3. **chamber-walk** — greedy walk over operation-edges, never repeating the
   same operation twice (isnaad's حجرة اللاتزامن).
4. **sky-journey** — a whole sūrah recited through the starfield, stations as
   constellations (isnaad's /watch/surah).
5. **gathering** — occurrences of one root/pattern/word gathered side by side
   (Sayyarah's القَبْضة forms).

## Build pipeline

```
data/raw        →  ingest/       →  data/index/*.json
registry/*.json →  verify/       →  build/  →  dist/ (static)
```

- `verify` pins every experience to its acceptance criteria (isnaad's
  `npm run verify` discipline): a change that breaks a pinned passage fails
  the build.
- `build` output is byte-identical to what's checked in; CI enforces it.
- No network, no database at build or runtime. Supabase-style persistence is
  optional and out of scope for v1.

## Deployment

Static on Vercel. One HTML shell + registry JSON + vendored data. The
prototype (Phase 1) deploys to a preview URL for the owner's review; the
approval gate happens there. Custom domain only after approval.

## What this is NOT

- Not a CMS, not user accounts, not social features — v1 is a public
  reading instrument.
- Not a translation project — Arabic only, no translation layer.
- Not tafsīr — the system points at where to look; it does not interpret
  (cf. Sayyarah's refusals, isnaad's "استنباط آلي" honesty note).
