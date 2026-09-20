> **[Cross_Plane_Layer]:** `rasm-mechanics`
> **[Core_Pillar]:** عربي — Arabi
> **[Unified_Dependency]:** Substrate Array → System Invariants

# Dotless Rasm Mechanics

## [Runway]

Dotless rasm mechanics treats the bare consonantal skeleton — الرسم — as the
original form of the language and therefore as the primary Substrate Array.
ARABIC_TIMELESS builds twenty layers above the inherited floor, while
al-Mirtāl's `corpus.py` independently reduces every form to rasm by stripping
diacritics and normalizing alif variants before any indexing begins. For this
pillar, the skeleton is not a degraded text but the programmable original:
everything computed must also be computable from the dots removed.

## [Excavator]

- **[R3] `README.md`** — the twenty layers in five bands; the claim that the dotless script has a programmable nature.
- **[R3] `spec/00-inherited.md`** … **`spec/07-segment.md`** — Bands I–II: the alphabet alone, then the alphabet become text (stroke, face, order, void, superposition, collapse, segment).
- **[R3] `lib/engine/alphabet.ts`** — `HIJAI`: the twenty-eight as code.
- **[R3] `lib/engine/text.ts`** — `expand`, `degree`, `profileOf`, `profile`: executable operations over skeletons.
- **[R3] `packages/arabic/index.ts`** (+ `index.test.ts`) — the arabic package.
- **[R3] `lib/engine/layers/band1.ts`**, **`band2.ts`** — the Band I–II layers as code.
- **[R1] `corpus.py`** — `rasm()`: `DIAC` strip, then alif-variant normalization (ٱ أ إ آ → ا, ى → ي, ة → ه); every index (`by_rasm`, n-grams) is built over the skeleton.
- **[R1] `sabab.py`** — `SababIndex` builds the formula index over rasm word sequences.
- **[R2] `data/corpus/*.txt`** — the Arabic-only corpus; **`src/lib/corpus.ts`** — corpus access.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Skeleton extraction | `corpus.py` `rasm()`: diacritic strip plus alif normalization | Arabic-only by design; morphology segments the untranslated text | `text.ts`: skeleton expansion, degree, and profiles as functions | Forces agreement on the skeleton function: two independent dotless reductions must converge on the same Substrate Array. |
| Ambiguity contract | The formula index collects matches across every width, refusing to hide destinations | Detectors report configurations; the reading belongs to the reader | `spec/05-superposition.md`: a skeleton denotes a set of words, never one | Forces every architecture to declare how many readings a skeleton admits — the ambiguity must be counted, not wished away. |
| Layered definition | Layer 0 (segment-addressable muṣḥaf) is stated, then Layers 1–4 build on it | Morphology → isnād → detectors → cosmos: each stage consumes the last | Layer 0 is stated and set aside; the twenty layers depend in sequence | Forces layering discipline: what is inherited is stated once and set aside, never re-derived upward by stealth. |
