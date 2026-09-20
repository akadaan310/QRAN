> **[Cross_Plane_Layer]:** `shape-class`
> **[Core_Pillar]:** عربي — Arabi
> **[Unified_Dependency]:** Substrate Array → System Invariants

# Shape Classes

## [Runway]

Shape classes partition the alphabet by what the hand and the eye cannot
change: the valence partition of six closed and twenty-two open letters, and
the extremes of the tooth carrying five letters against six letters carrying
one shape each. Layer 2 establishes the partition by six trials, and Layer 14
shows it is a union of complete shape classes, which is why it survives every
silent substitution. For this pillar, classification is structural rather than
pedagogical: a class exists only if no operation in the architecture can break
it.

## [Excavator]

- **[R3] `spec/02-face.md`** — the core statement: "A letter is not an atom. It is a function of its neighbours."; the valence partition by six trials.
- **[R3] `spec/15-symmetry.md`** — fixed points under every transformation above.
- **[R3] `spec/20-invariance.md`** — the partition survives as a union of complete shape classes; the tooth and the six: maximum and minimum openness, both structural, both permanent.
- **[R3] `lib/engine/patterns.ts`** — `abstractWord`: the pattern level above letters.
- **[R3] `lib/engine/layers/band2.ts`** — Band II (The Skeleton) as code.
- **[R1] `sabab.py`** — `ishtimal` (اشتمال حرفي): letter-set containment between fawātiḥ clusters (⊂ / ⊃), a structural classification of the initials.
- **[R2] `src/lib/morphology.ts`**, **`src/lib/lexicon.ts`** — segment classes; `AGENCY_ROOTS`, `KHALQ_LEMMAS`: lexical classes with structural jobs.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Partition stability | `ishtimal` containment between fawātiḥ clusters (⊂/⊃) | Eight detector classes; offices that seat a referent versus those that merely point | Valence partition as a union of complete shape classes | Forces partitions to be operation-closed: a class must survive the transforms each architecture applies, or it is pedagogy, not structure. |
| Extremes | The fawātiḥ table: initials as a distinguished class | — (works above the letter level) | The tooth (five letters, one shape) versus the six (one letter, one shape) | Forces extremes to be named: maximum and minimum openness must be measurable wherever the substrate appears. |
| Neighbour function | `tamathul`: structural parallelism by shared POS pattern | `frames.ts` / `frameAt`: the contour as a function of position | `spec/02`: a letter is a function of its neighbours | Forces context dependence: identity must be computed from the neighbourhood, never assumed atomic. |
