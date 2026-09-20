> **[Cross_Plane_Layer]:** `error-code`
> **[Core_Pillar]:** حكماً عربياً — Hukman Arabiyyan
> **[Unified_Dependency]:** Rigidity Coefficient → System Invariants

# Error-Correcting Codes

## [Runway]

Error-correcting codes are the reason the system crosses eras intact: the
layers are codes for one another, so no single failure is total. Layer 19
reads the invariance table as a defence — an observable that changes under a
corruption detects it, one that survives is blind to it — and maps six damage
classes against six channels. For this pillar, redundancy is not backup but
structure: every channel the text carries is a check on every other, which is
why no one channel has to survive.

## [Excavator]

- **[R3] `spec/19-damage.md`** — the core statement: "The layers are error-correcting codes for one another."; six damage classes (substitution, deletion, insertion, transposition, demarking, vocalic); the detection map across Skeleton, Profile, Weight, Pulse, Pattern, Root.
- **[R3] `spec/05-superposition.md`** — a skeleton denotes a set of words, never one: ambiguity as the code's alphabet.
- **[R3] `spec/18-memory.md`** — the skeleton as a compression format.
- **[R3] `lib/engine/collapse.ts`** — the terminal check: did the true reading survive the filters?
- **[R1] `corpus.py`** — `rasm()` normalization absorbs orthographic damage: alif variants collapse, ة settles to ه, diacritics vanish.
- **[R2] `data/index/motifs.json`** — shipped index integrity: five dangling `mirrorOf` references (verified 2026-09-19) — a live specimen of the damage class.
- **[R2] `scripts/verify-exemplars.ts`**, **`scripts/verify-cosmos.ts`** — the integrity gates.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Damage taxonomy | Orthographic normalization classes in `rasm()` | Shipped-data integrity: dangling `mirrorOf` references as a live specimen | Six damage classes: substitution, deletion, insertion, transposition, demarking, vocalic | Forces a shared taxonomy: every corruption must be nameable in all three architectures before it can be detected. |
| Detection map | Evidence typed نصّي (settled by text) versus إدراكي (declared) | Structural findings only; nothing interpreted beyond the morphology | The invariance table read as defence: changing observables detect, surviving ones are blind | Forces detection semantics: each architecture must state which corruptions it detects and which it is blind to. |
| Cross-channel recovery | The formula index recovers crossings the neighbourhood cannot reach | رِباط holds lexical continuity against isnād motion | The layers are codes for one another; no one channel has to survive | Forces redundancy contracts: the loss of any single channel must be recoverable from the others, by construction rather than by luck. |
