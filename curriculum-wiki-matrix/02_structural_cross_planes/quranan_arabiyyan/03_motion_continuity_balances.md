> **[Cross_Plane_Layer]:** `continuity-balance`
> **[Core_Pillar]:** قرآناً عربياً — Qur'anan Arabiyyan
> **[Unified_Dependency]:** Rigidity Coefficient → System Invariants

# Motion-Continuity Balances

## [Runway]

Motion-continuity balances are the measured trade-offs between how much moves
and how much holds still in a single reading act. Isnād Studio's master
metric is the product of lexical continuity and isnād delta, discovered from
Hūd 29, Qāf 2, and al-Qaṣaṣ 4–5 rather than imposed, while al-Mirtāl scores
وَزْن and قُرْب apart because adjacency carries maximal bits and minimal
surprise. For this pillar, the balance is the Rigidity Coefficient itself: a
number that says how much grammar moved while the words stayed.

## [Excavator]

- **[R2] `README.md`** — the master metric `lexicalContinuity × isnādDelta`, fallen out of the three exemplar passages rather than imposed; "maximum grammatical motion held against maximum lexical continuity."
- **[R2] `src/lib/engine/detectors.ts`** — `ribat` scoring; `DEFAULT_OPTIONS` (`minScore`, `stitchWindow`, `echoWindow`, `minAbsenceRun`, `minNarrativeRun`).
- **[R2] `scripts/verify-exemplars.ts`** — pins the engine to Hūd 29, Qāf 2, al-Qaṣaṣ 4–5; `npm run verify` fails the build if they are lost.
- **[R1] `generate.py`** — وَزْن versus قُرْب scored apart ("different quantities and must be scored apart"); degree equals wazn plus qurb; `Generator` floors `min_bits`, `min_score`.
- **[R3] `lib/engine/collapse.ts`** — filters applied in cost order; each records what it removed, so pruning is auditable step by step.
- **[R3] `spec/16-hand.md`** — the cost model: every operation gets a price the hand can pay.
- **[R3] `lib/engine/__tests__/reader.test.ts`** — the reading procedure under test.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Master metric | degree = wazn + qurb, with crossing tolls priced separately | `lexicalContinuity × isnādDelta`, discovered from exemplars | Filter cost ordering; hand cost model | Forces metric commensurability: each architecture's headline number must decompose into a motion part and a continuity part, or the balances cannot be compared. |
| Exemplar pinning | `build.py` and the table scripts check the shipped tables | `verify-exemplars.ts`: a change that stops finding the three passages is wrong | `engine.test.ts`, `corpus.test.ts`, `reader.test.ts` pin engine behavior | Forces shared acceptance: the same three passages must be recoverable by all three architectures, each in its own terms. |
| Scored-apart quantities | وَزْن and قُرْب are different quantities, scored apart, never collapsed | Continuity and delta are multiplied, not merged into one opaque score | Accounted loss: every operation either inverts or its loss is exactly quantifiable | Forces separation of concerns: information, proximity, and loss must remain distinct measurable quantities in every architecture. |
