> **[Cross_Plane_Layer]:** `pillar-index`
> **[Core_Pillar]:** قرآناً عربياً — Qur'anan Arabiyyan
> **[Unified_Dependency]:** Substrate Array → Rigidity Coefficient

# [Pillar: قرآناً عربياً] — Index

The pillar of the text as continuous, unmediated Arabic. No commentary may
stand between one رتلة and the next, and no translation may stand between
the reader and the line.

## Cross-planes in this pillar

| File | Cross-plane | What it isolates |
|---|---|---|
| `01_continuous_text_alignment.md` | `text-alignment` | Raw text stacked against raw text; apparatus in the margin |
| `02_text_tracking.md` | `text-tracking` | Identity preservation of a passage under displacement |
| `03_motion_continuity_balances.md` | `continuity-balance` | Measured trade-offs between what moves and what holds still |

## [Runway]

قرآناً عربياً is the pillar of the text as continuous, unmediated Arabic: no
commentary may stand between one رتلة and the next, and no translation may
stand between the reader and the line. Its three cross-planes are continuous
text alignment, text tracking, and motion-continuity balances. Every file
here must keep the Substrate Array intact while measuring how much of it
holds still.

## [Excavator]

- **[R1] `README.md`** — the governing constraint: citations, role labels, and weights are apparatus in the margin, never in the line.
- **[R1] `ops.py`** — `wasl`, `hamal`, `ihata`: the stitching operators of unmediated alignment.
- **[R1] `majra.html` / `majra.json`** — the flow (مجرى) surface and its data: tracking made visible.
- **[R2] `src/lib/engine/detectors.ts`** — `ribat` (رِباط الملتقى): lexical continuity held against isnād motion.
- **[R2] `src/lib/cosmos/strands.ts`** — strand tracking across the cosmos.
- **[R3] `lib/engine/collapse.ts`** — the reading procedure: expand, prune in cost order, check survival.
- **[R3] `spec/07-segment.md`** — the chunk profile: a signature independent of the letters.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Mediation boundary | Apparatus sits in the margin; the line carries text only | Detectors never interpret; the reading belongs to the reader | Layer Contract: substrate independence, hand-verifiability | All three must keep apparatus separable from substrate — forcing a shared, testable mediation boundary. |
| Continuity measure | وَزْن scores information; قُرْب scores proximity; the two are never collapsed | رِباط multiplies lexical continuity by isnād delta | Chunk profiles and filter survival rates measure what held | Forces the Rigidity Coefficient to be computable in every architecture on the same passages. |
| Tracked identity | `majra.json` carries the flow as data | `locus.ts` joins every finding to a placed node by index only | `timeline.ts` and `teleport.ts` carry ordered movement | Forces identity semantics: a tracked passage must resolve to identical Substrate Array coordinates in all three. |
