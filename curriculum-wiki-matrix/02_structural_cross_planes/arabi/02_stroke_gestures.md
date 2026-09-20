> **[Cross_Plane_Layer]:** `stroke-gesture`
> **[Core_Pillar]:** عربي — Arabi
> **[Unified_Dependency]:** Substrate Array → System Invariants

# Stroke Gestures

## [Runway]

Stroke gestures reverse the usual description: a letter is not a shape but a
recorded gesture, and the shape is residue. Six atomic motions — upright,
tooth, bowl, knot, tail, shoulder — generate all twenty-eight letters under
the layer's three composition operators. For this pillar, writability is
provability: a letter exists in عربي only insofar as a hand can perform it.

## [Excavator]

- **[R3] `spec/01-stroke.md`** — the core statement: "A letter is not a shape. It is a recorded gesture. The shape is residue."; the six atomic strokes; the three composition operators (join/وصل, lift/رفع, and the third).
- **[R3] `lib/engine/layers/band1.ts`** — Band I (The Alphabet Alone) as code.
- **[R3] `spec/16-hand.md`** — the realizability test: every operation gets a cost.
- **[R3] `spec/17-articulation.md`** — the body as address space: the points of production from the cavity outward.
- **[R3] `spec/20-invariance.md`** — the stroke inventory survives reversal, mirroring, and rotation: the primitives are motions a hand makes, not conventions.
- **[R1] `corpus.py`** — `Seg(sura, aya, word, seg, form, pos, feats, root, lem, rasm)`: atomicity at segment granularity.
- **[R2] `src/lib/morphology.ts`** — word segments with grammatical roles; **`src/lib/types.ts`** — the `Segment` contract.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Atomic inventory | `Seg` namedtuple: the indivisible unit is the addressed segment | `Segment`: person-bearing units with offices that seat or merely point | Six strokes: the indivisible units are motions, and the inventory is invariant | Forces atomicity to be explicit: each architecture must name its indivisible unit and show that everything composes from it. |
| Composition operators | Eight acts compose over citation-sequences (`ops.py`) | Detectors compose into discoveries; frames compose into contours | Three stroke operators; `spec/14-composition.md`: which operations commute | Forces operator tables: which compositions commute and which do not must be stated and measured, never assumed. |
| Hand test | `build.py` rebuilds the HTML from JSON: the pipeline is re-performable | Arabic-only UI: no translation crutch may carry a claim | Layer Contract: substrate independence and hand-verifiability | Forces the hand as the final instrument: any claim must be checkable by one person, without instruments and without trusting anyone. |
