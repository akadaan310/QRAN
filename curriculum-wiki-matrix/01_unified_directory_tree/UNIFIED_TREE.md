# Unified Directory Tree

The single merged index of the three repository HEADs (shallow clones of
public HEAD, 2026-09-20), reorganized under the Unified Nomenclature planes.

**Legend:** `[R1]` al-Mirtāl (`akadaan310/CHATGPTNMYOWNER`, 31 files) ·
`[R2]` Isnād Studio (`akadaan310/isnaad`, 244 files) ·
`[R3]` ARABIC_TIMELESS (`akadaan310/ARABIC_TIMELESS`, 165 files)

Per-sūrah corpus files are collapsed to globs. Paths are repo-relative.

## substrate-array/ — base text objects

**[R1] — flat pipeline**
`corpus.py`, `words.json`, `majra.json`, `awwal.json`, `bundle.json`,
`edges.json`, `build.py`, `bundle.py`, `awwal_data.py`, `words_table.py`,
`edges_table.py`

**[R2] — committed data + corpus access**
`data/corpus/1.txt` … `data/corpus/114.txt`, `data/corpus/meta.json`,
`data/index/ayaat.json`, `data/index/roots.json`, `data/surahs.json`,
`src/lib/corpus.ts`, `scripts/ingest-quran.ts`

**[R3] — lexicon data + corpus engine**
`lib/data/surface.json`, `lib/data/roots.json`, `lib/data/lemmas.json`,
`lib/data/ATTRIBUTION.md`, `lib/engine/corpus.ts`, `lib/engine/text.ts`,
`lib/engine/lexdata.ts`, `lib/engine/lexicon.ts`,
`packages/corpus/index.ts`, `packages/corpus/index.test.ts`,
`scripts/build-lexicon.mjs`, `scripts/build-artifact-data.mjs`

## attribution-vectors/ — relational links / isnād paths

**[R1]**
`sabab.py` (six سبب generators), `edges.json`, `edges_table.py`,
`generate.py` (candidate scoring)

**[R2]**
`src/lib/isnad.ts`, `src/lib/engine/detectors.ts`,
`src/lib/engine/graph.ts`, `src/lib/engine/motifs.ts`,
`src/lib/engine/frames.ts`, `src/lib/engine/labels.ts`,
`src/lib/engine/aalam-miner.ts`, `src/lib/lexicon.ts`,
`src/lib/morphology.ts`, `data/index/motifs.json`,
`data/index/discoveries.json`, `data/index/aalam.json`,
`data/index/manifest.json`,
`supabase/migrations/01_isnad_quran_schema.sql`,
`src/app/api/motifs/route.ts`, `src/app/api/discoveries/route.ts`,
`src/app/api/resonance/route.ts`, `src/app/api/chamber/route.ts`,
`src/app/api/assemble/route.ts`, `scripts/verify-exemplars.ts`

**[R3]**
`packages/relation/index.ts`, `packages/relation/index.test.ts`,
`packages/discovery/index.ts`, `packages/discovery/index.test.ts`,
`packages/provenance/index.ts`, `packages/provenance/index.test.ts`,
`lib/engine/patterns.ts`, `docs/engine-sdk/EXTRACTION_LEDGER.md`

## rigidity-coefficient/ — continuity metrics

**[R1]**
`generate.py` (وَزْن + قُرْب scoring; العتبة crossing tolls; floors)

**[R2]**
`src/lib/engine/detectors.ts` (رِباط: lexicalContinuity × isnādDelta),
`src/lib/engine/assembler.ts`, `scripts/verify-exemplars.ts`

**[R3]**
`lib/engine/collapse.ts`, `spec/07-segment.md`, `spec/16-hand.md`,
`lib/engine/__tests__/reader.test.ts`

## system-invariants/ — layer mechanics / operator rules

**[R1]**
`ops.py` (operator algebra; Mode ISNAD/TAWJIH admissibility),
`doc.html` (رَتْلًا وَتَرْتِيلًا — the formalism)

**[R2]**
`src/lib/engine/detectors.ts` (eight detectors; DEFAULT_OPTIONS),
`src/lib/engine/surah-composition.ts`, `src/lib/composition.ts`,
`src/lib/time-module.ts`, `src/lib/numerals.ts`,
`src/lib/types.ts`, `scripts/verify-cosmos.ts`

**[R3]**
`spec/00-inherited.md` … `spec/20-invariance.md` (all twenty-one layers),
`lib/engine/invariance.ts`, `lib/engine/registry.ts`,
`lib/engine/operations.ts`, `lib/engine/resolve.ts`,
`lib/engine/variants.ts`, `lib/engine/alphabet.ts`,
`lib/engine/layers/band1.ts`, `lib/engine/layers/band2.ts`,
`lib/engine/layers/band3.ts`, `lib/engine/layers/band4.ts`,
`lib/engine/layers/band5.ts`, `lib/engine/layers/helpers.ts`,
`packages/arabic/index.ts`, `packages/arabic/index.test.ts`,
`packages/structure/index.ts`, `packages/structure/index.test.ts`,
`packages/capability/index.ts`, `packages/capability/index.test.ts`,
`packages/example/e2e.test.ts`, `packages/README.md`,
`docs/engine-sdk/ARCHITECTURE.md`,
`lib/engine/__tests__/engine.test.ts`,
`lib/engine/__tests__/engine-sdk-invertibility.test.ts`,
`lib/engine/__tests__/compose.test.ts`,
`lib/engine/__tests__/corpus.test.ts`, `vitest.config.ts`

## locus-coordinates/ — stations / movements

**[R1] — navigator surfaces**
`app.html` (4 modes), `navigator.html`, `mirtal.html`, `majra.html`,
`rukub.html`, `awwal.html`, `onboard.html`, `vercel/index.html`,
`vercel.json`

**[R2] — cosmos engine + voyage surfaces**
`src/lib/cosmos/locus.ts`, `src/lib/cosmos/voyage.ts`,
`src/lib/cosmos/placement.ts`, `src/lib/cosmos/coverage.ts`,
`src/lib/cosmos/wire.ts`, `src/lib/cosmos/immersion.ts`,
`src/lib/cosmos/morphogen.ts`, `src/lib/cosmos/recitation.ts`,
`src/lib/cosmos/structures.ts`, `src/lib/cosmos/strands.ts`,
`src/lib/cosmos/stellar.ts`, `src/lib/cosmos/textures.ts`,
`src/lib/cosmos/chroma.ts`, `src/lib/cosmos/basis.ts`,
`src/lib/cosmos/device.ts`, `src/lib/cosmos/types.ts`,
`src/lib/cosmos/index.ts`,
`src/components/cosmos/scene.tsx`, `src/components/cosmos/rihla.tsx`,
`src/components/cosmos/rihla-scene.tsx`,
`src/components/cosmos/rihla-hud.ts`,
`src/components/cosmos/strand-panel.tsx`,
`src/components/cosmos/use-strands.ts`,
`src/components/cosmos/use-recitation.ts`,
`src/components/cosmos/isnad-vector.tsx`,
`src/components/cosmos/grain-card.tsx`, `src/components/cosmos/fmc.tsx`,
`src/components/cosmos/detector-cut.tsx`,
`src/components/cosmos/cosmos.tsx`,
`src/components/cosmos/body-field.ts`,
`src/components/cosmos/basis-control.tsx`,
`src/components/navigator.tsx`, `src/components/reader.tsx`,
`src/components/studio.tsx`, `src/components/explorer.tsx`,
`src/components/composer.tsx`, `src/components/matrix.tsx`,
`src/components/waveform.tsx`, `src/components/ui/index.tsx`,
`src/components/istiadha/sequence.tsx`,
`src/components/furqan/sky.tsx`, `src/components/furqan/player.tsx`,
`src/components/furqan/celestial.tsx`,
`src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`,
`src/app/icon.svg`, `src/app/explore/page.tsx`,
`src/app/studio/page.tsx`, `src/app/compose/page.tsx`,
`src/app/gallery/page.tsx`, `src/app/rihla/page.tsx`,
`src/app/watch/[id]/page.tsx`, `src/app/watch/surah/[id]/page.tsx`,
`src/app/api/surah/[id]/route.ts`, `src/app/api/sky/route.ts`,
`src/app/api/sky/astrophysics/route.ts`, `src/app/api/cosmos/route.ts`,
`src/app/api/cosmos/strands/route.ts`,
`src/app/api/cosmos/basis/route.ts`,
`src/app/api/compositions/route.ts`,
`src/app/api/compositions/[id]/route.ts`,
`src/app/api/istiadha/route.ts`, `src/app/api/render/route.ts`,
`src/app/api/aalam/route.ts`, `src/lib/aalam.ts`,
`src/lib/compositions.server.ts`, `src/lib/data.server.ts`,
`src/lib/istiadha.ts`, `src/lib/notes.ts`, `src/lib/utils.ts`,
`src/lib/view.ts`, `data/cosmos/nodes.json`,
`data/sky/sky.json`, `data/sky/astrophysics.json`,
`scripts/ingest-cosmos.ts`, `scripts/ingest-sky.ts`,
`scripts/ingest-gaia.ts`, `scripts/compare-basis.ts`,
`scripts/find-structures.ts`, `scripts/seed-composition.ts`,
`public/*`

**[R3] — engine movement + reading surfaces**
`lib/engine/timeline.ts`, `lib/engine/teleport.ts`,
`lib/engine/reader.ts`, `lib/engine/passage.ts`,
`lib/engine/examples.ts`, `lib/engine/compose.ts`,
`packages/spatial/index.ts`, `packages/spatial/index.test.ts`,
`packages/traversal/index.ts`, `packages/traversal/index.test.ts`,
`components/PassageReader.tsx`, `components/Teleport.tsx`,
`components/TimeTravel.tsx`, `components/Walkthrough.tsx`,
`components/LiveMode.tsx`, `components/Workspace.tsx`,
`components/LayerStack.tsx`, `components/XRay.tsx`,
`components/WordPair.tsx`, `components/Composer.tsx`,
`components/CollapseView.tsx`, `components/InvarianceView.tsx`,
`components/AlphabetExplorer.tsx`, `components/ui.tsx`,
`lib/markdown.tsx`, `app/*`, `apps/engine-lab/*`,
`public/engine-lab/*`, `artifact/*`, `scripts/sync-engine-lab.mjs`,
`scripts/build-artifact.mjs`

## docs-and-contracts/

**[R1]** `README.md`, `vercel/README.md`, `.gitignore`
**[R2]** `README.md`, `docs/PROJECT.md`, `.env.example`,
`next.config.mjs`, `package.json`, `package-lock.json`,
`postcss.config.mjs`, `tailwind.config.ts`, `tsconfig.json`,
`.eslintrc.json`, `.gitignore`
**[R3]** `README.md`, `packages/README.md`, `next.config.ts`,
`package.json`, `package-lock.json`, `tsconfig.json`,
`vitest.config.ts`, `postcss.config.mjs`, `next-env.d.ts`,
`.gitignore`

## Reading the tree

Each plane above is a Unified Nomenclature term; every file of the three
repositories appears under exactly one plane — the plane of the concept it
primarily implements. Files that serve two planes are listed under their
primary plane and cross-referenced from the structural files in
`02_structural_cross_planes/` via the Excavator tier.
