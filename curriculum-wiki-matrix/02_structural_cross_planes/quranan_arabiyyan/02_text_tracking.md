> **[Cross_Plane_Layer]:** `text-tracking`
> **[Core_Pillar]:** قرآناً عربياً — Qur'anan Arabiyyan
> **[Unified_Dependency]:** Substrate Array → Attribution Vectors → Locus Coordinates

# Text Tracking

## [Runway]

Text tracking follows a passage, formula, or strand as it moves through the
Substrate Array, keeping its identity intact across distance. al-Mirtāl tracks
majra — the flow — through `edges.json` and the majra surface, while Isnād
Studio tracks strands and loci through the cosmos join that maps every mined
finding to a placed node. For this pillar, tracking is identity preservation
under displacement: whatever moves must still be the same text when it
arrives.

## [Excavator]

- **[R1] `majra.html` / `majra.json`** — the flow surface and its data: the tracked course through the text.
- **[R1] `edges.json`** — the typed Attribution Vectors the flow follows; `edges_table.py` tabulates them.
- **[R2] `src/lib/cosmos/strands.ts`** — strand tracking across the cosmos field.
- **[R2] `src/lib/cosmos/locus.ts`** — `locusKey`, `LocusJoin`, `Coverage`: the join holds only indices; the node stays the single source of truth.
- **[R2] `src/components/cosmos/strand-panel.tsx`** — the strand tracking surface.
- **[R2] `data/cosmos/nodes.json`** — the placed nodes; `scripts/ingest-cosmos.ts` builds them.
- **[R3] `packages/traversal/index.ts`** — the traversal package (+ test suite).
- **[R3] `lib/engine/timeline.ts`** — ordered movement; `lib/engine/teleport.ts` — displacement; `lib/engine/passage.ts` — passage handling.
- **[R3] `components/PassageReader.tsx`**, **`components/Teleport.tsx`** — the tracking surfaces.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Identity under displacement | `majra.json` carries the flow; `edges.json` carries the typed links | `strands.ts` tracks strands; `locus.ts` joins findings to nodes by index only | `traversal` package; `teleport.ts` displaces; `timeline.ts` orders | Forces identity semantics: a tracked item must resolve to identical Substrate Array coordinates in all three, or "tracking" is three different verbs. |
| Placement audit | `bundle.json` embeds the shipped data bundle (`bundle.py`) | `nodes.json` places loci; `Coverage` reports offered versus placed | `artifact/data.json` ships the artifact bundle (`build-artifact-data.mjs`) | Forces a placement audit: offered versus placed loci must be countable in every architecture. |
| Voyage surface | `majra.html`, `rukub.html` | `rihla.tsx`, `rihla-scene.tsx`: the voyage rendered | `TimeTravel.tsx`, `Walkthrough.tsx` | Forces Locus Coordinates to carry the voyage: tracking is not a list of hits but a traversable path with a start, a course, and an arrival. |
