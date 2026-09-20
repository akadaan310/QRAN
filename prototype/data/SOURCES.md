# Data provenance

All fixture JSON under `data/pages/` is **generated**, never hand-edited.
Regenerate with `npm run fixtures`, which runs `scripts/gen-fixtures.mjs`.

## Text + morphology

Source: `references/isnaad/data/corpus/<surah>.txt`, vendored there from the
**Tanzil** project's Uthmani ʿUthmānī text and the **Quranic Arabic Corpus
v0.4** (Kais Dukes) word-level morphological tagging — see
`references/isnaad/README.md` and `references/isnaad/docs/PROJECT.md` for
the full citation. This prototype reads that vendored copy read-only; it
does not re-fetch or re-derive it.

## What is fact and what is a fixture (measurement honesty)

- **Fact, directly from the corpus:** every word's Uthmani spelling, root,
  lemma, part of speech, and person/number/gender tag. The rasm `skeleton`
  string per word is a deterministic transform of the marked text (harakat
  stripped, dotted letters folded onto a shared base stroke) — a *visual
  approximation* for the F17 rasm-reveal demo, not a paleographic claim; the
  exact letter-grouping table is in `scripts/gen-fixtures.mjs`.
- **Fixture, derived by this prototype's generator, not by any reference
  project's detector engine:** the five lane-state values (`intensity`,
  `friction`, `axis`, `lens`, `depth`). product-spec/01 describes these as
  the output of al-Mirtāl's edge weights and Isnād Studio's detector run
  against the full corpus; no such run exists for the specific loci chosen
  here. `gen-fixtures.mjs` computes a labeled heuristic instead — root
  repetition on the page, the person-tag axis blend, and direct-speech
  verb (`قول`) detection — and every page's `provenance.method` field says
  this explicitly. A lane with no qualifying signal gets `lens: null`; per
  product-spec/01 "Pipeline integrity", the absence is data, not a gap to
  paper over.
- **Fixture, curatorial:** which sūrahs/āyāt make up each of the 3 sample
  pages (see `prototype/QA_NOTES.md` §Sample-page decision), and the
  `checkpoints` array (native timeline checkpoints are placed where the
  friction heuristic crosses 0.55, labeled "shallow", or 0.7, labeled
  "deep" — a proxy for "chronological boundary", not a claim that these are
  the pipeline's actual boundary detections).

## Fonts

`public/fonts/amiri-quran-*.woff2` and `public/fonts/noto-kufi-arabic-*.woff2`
are copied read-only from `references/isnaad/public/fonts/` (Amiri Quran and
Noto Kufi Arabic, both SIL Open Font License). IBM Plex Mono, named in
`docs/PHASE-01-UI-SYSTEM.md` for margin apparatus, is substituted with the
system monospace stack — see `docs/PHASE-01-UI-SYSTEM.md` §6 for the
justification.
