> **[Cross_Plane_Layer]:** `pillar-index`
> **[Core_Pillar]:** عربي — Arabi
> **[Unified_Dependency]:** Substrate Array → System Invariants

# [Pillar: عربي] — Index

The pillar of the Arabic substrate itself: the dotless skeleton, the gestures
that write it, the shape classes it falls into, and the contract every layer
must satisfy. It isolates what is true of the script before any particular
text is read.

## Cross-planes in this pillar

| File | Cross-plane | What it isolates |
|---|---|---|
| `01_dotless_rasm_mechanics.md` | `rasm-mechanics` | The bare consonantal skeleton as primary Substrate Array |
| `02_stroke_gestures.md` | `stroke-gesture` | Letters as recorded gestures; six atomic motions |
| `03_shape_classes.md` | `shape-class` | Valence partition and structural extremes |
| `04_layer_contract_validation.md` | `layer-contract` | The five-condition admission test for every layer |

## [Runway]

عربي is the pillar of the Arabic substrate itself: the dotless skeleton, the
gestures that write it, the shape classes it falls into, and the contract
every layer must satisfy. It isolates what is true of the script before any
particular text is read. Every file here must be executable by hand and
checkable without instruments, or it does not belong to this pillar.

## [Excavator]

- **[R3] `README.md`** — the twenty layers in five bands; the Layer Contract's five conditions.
- **[R3] `spec/01-stroke.md`** — the letter as recorded gesture; six atomic strokes.
- **[R3] `spec/02-face.md`** — the letter as a function of its neighbours; the valence partition.
- **[R3] `spec/20-invariance.md`** — what survives all nineteen layers.
- **[R1] `corpus.py`** — `rasm()`: independent dotless reduction (diacritic strip, alif normalization).
- **[R2] `src/lib/morphology.ts`** — segment morphology; the Arabic-only design rule (`README.md`: no translations anywhere, by design).

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Skeleton function | `rasm()` strips diacritics and normalizes alif variants before indexing | Arabic-only corpus; morphology works on segments | `text.ts` `expand`/`degree`/`profileOf` over skeletons | Two independent implementations of dotless reduction must converge on the same Substrate Array — forcing a shared skeleton function. |
| Hand executability | `build.py` rebuilds the HTML surfaces from JSON | No translations anywhere, by design | Layer Contract: substrate independence, hand-verifiability | Forces the hand as final instrument: every claim must be checkable by one person without instruments and without trusting anyone. |
| Layering discipline | Layer 0 stated (segment-addressable muṣḥaf), then built upon | Engine layers: morphology → isnād → detectors → cosmos | Layer 0 stated and set aside; Bands I–V depend in sequence | Forces inherited definitions to be stated and set aside, never smuggled upward. |
