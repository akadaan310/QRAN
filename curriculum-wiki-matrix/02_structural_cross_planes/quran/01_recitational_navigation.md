> **[Cross_Plane_Layer]:** `navigation`
> **[Core_Pillar]:** قرآن — Qur'an
> **[Unified_Dependency]:** Substrate Array → Attribution Vectors → Locus Coordinates

# Operational Recitational Navigation

## [Runway]

Recitational navigation is the operation of moving through the Substrate Array
one رتلة at a time, where each move is licensed by an Attribution Vector
rather than by commentary or gloss. In al-Mirtāl this is literal: Layer 2's
operator algebra acts on citation-sequences, and the Furqān planner scores
every candidate as degree equals wazn plus qurb, taxing each sūrah crossing
with a toll. For this pillar, navigation is therefore not browsing but
licensed traversal: no step exists unless the text itself attests the edge.

## [Excavator]

- **[R1] `README.md`** — governing constraint: nothing stands between one رتلة and the next but the text itself; apparatus stays in the margin.
- **[R1] `corpus.py`** — Layer 0: the segment-addressable Substrate Array (`Seg` at sura/aya/word/seg; `rasm()` normalization).
- **[R1] `ops.py`** — Layer 2: the operator algebra over citation-sequences — `hamal`, `wasl`, `aks`, `daght`, `ihata`, `fasl`, `isqat`, `jam`; `Mode.ISNAD` versus `Mode.TAWJIH` admissibility.
- **[R1] `generate.py`** — Layers 3–4: the Furqān planner; `ADJACENT`, `NEAR_DECAY`, `CROSSING` tolls and the `CROSS_BAR` admission bar; `Generator` floors.
- **[R1] `app.html`** — the navigator in four modes; **[R1] `doc.html`** — the رَتْلًا وَتَرْتِيلًا formalism.
- **[R2] `src/components/navigator.tsx`** — the studio navigation surface.
- **[R2] `src/app/watch/surah/[id]/page.tsx`** — الفرقان: a whole sūrah recited through the sky.
- **[R2] `src/lib/cosmos/voyage.ts`** — voyage mechanics over placed loci.
- **[R3] `lib/engine/reader.ts`** — the reading procedure as executable code.
- **[R3] `lib/engine/timeline.ts`** — ordered movement through the substrate.
- **[R3] `packages/traversal/index.ts`** — the traversal package with its test suite.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Licensed step | Every act in `ops.py` is mode-gated; `isqat` is forbidden in مقام الإسناد | Detectors report structural configurations and never interpret; the reading belongs to the reader | Collapse filters run in cost order and a filter with no data is reported skipped, never faked | All three must expose what a move is allowed to cite — forcing a shared admissibility vocabulary across the matrix. |
| Crossing cost | `generate.py`: leaving the sūrah pays `CROSSING` and must clear `CROSS_BAR` | The رِباط master metric prices motion against continuity (`lexicalContinuity × isnādDelta`) | `lib/engine/collapse.ts` prices every filter; `spec/16-hand.md` prices every operation for the hand | Forces cost semantics to be comparable: bits, products, and hand-costs must be inter-translatable, or "expensive" means nothing across architectures. |
| Continuous surface | `app.html` four modes; `majra.html` flow surface | `/explore`, `/watch`, `/rihla` surfaces; `placement.ts` joins findings to nodes | `PassageReader.tsx`, `Teleport.tsx`, `TimeTravel.tsx` | Forces agreement on Locus Coordinates: `(sūrah, āyah, word-span)` addressing must survive translation between all three surfaces. |
