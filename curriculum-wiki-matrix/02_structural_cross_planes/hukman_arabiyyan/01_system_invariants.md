> **[Cross_Plane_Layer]:** `system-invariant`
> **[Core_Pillar]:** حكماً عربياً — Hukman Arabiyyan
> **[Unified_Dependency]:** System Invariants → Rigidity Coefficient

# System Invariants

## [Runway]

System Invariants are the operations that may be performed and the quantities
they cannot change: the count of twenty-eight, the valence partition, the
stroke inventory, weight under permutation. ARABIC_TIMELESS computes its
invariance table from the engine's own definitions rather than copying the
document, so the table is a measurement rather than a claim. For this pillar,
an invariant is what remains when every admissible transformation has been
applied — and admissibility itself, like the مقام that forbids الإسقاط in
إسناد mode, is part of the invariant.

## [Excavator]

- **[R3] `spec/20-invariance.md`** — the six invariants: the count (twenty-eight), the valence partition (six closed, twenty-two open), the stroke inventory (six atomic motions), the articulatory order, weight under permutation, the tooth and the six; plus the computed constants.
- **[R3] `lib/engine/invariance.ts`** — "Layer 14's invariance table — computed, never tabulated." For every observable × every transform, run the transform over sampled words and check survival; `Verdict`: invariant, changes, undefined.
- **[R3] `spec/14-composition.md`** — the invariance table; which operations commute and which do not.
- **[R1] `ops.py`** — `Mode.ISNAD` (إسقاط forbidden) versus `Mode.TAWJIH` (permitted); `jam` admissible only if the union is attested in the muṣḥaf: admissibility as invariant.
- **[R2] `src/lib/engine/detectors.ts`** — the eight detectors and `DEFAULT_OPTIONS`: the engine's invariant core; none of them interpret.
- **[R2] `src/lib/isnad.ts`** — `SUBJECT_ROLES`: the offices that seat a referent versus those that merely point — the distinction every detector stands on.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Admissibility | Mode-gated acts: `isqat` and `jam` carry admissibility conditions | Detectors report structure and never interpret; the distinction is load-bearing | The five Layer Contract conditions admit or cut every layer | Forces admissibility to be explicit: every architecture must say which moves are forbidden, where, and why. |
| Computed tables | The operator algebra is code, not prose (`ops.py`) | `verify-exemplars.ts` recomputes acceptance on every run | `invariance.ts` derives the table from the engine; the discovery detector falls out of differing rows | Forces tables to be derived: no invariant may be asserted that the code cannot recompute from its own definitions. |
| What survives | Fawātiḥ unions survive only when attested | The three exemplars (Hūd 29, Qāf 2, Qaṣaṣ 4–5) must survive every change | Twenty-eight; the valence partition; the stroke inventory; weight | Forces survival semantics: each architecture must name, in advance, what its transforms are not allowed to move. |
