> **[Cross_Plane_Layer]:** `pillar-index`
> **[Core_Pillar]:** قرآن — Qur'an
> **[Unified_Dependency]:** Substrate Array → Attribution Vectors → Locus Coordinates

# [Pillar: قرآن] — Index

The pillar of the recited text in motion. It isolates everything the three
architectures do to navigate, mine, and route the Substrate Array as
recitation rather than as object.

## Cross-planes in this pillar

| File | Cross-plane | What it isolates |
|---|---|---|
| `01_recitational_navigation.md` | `navigation` | Licensed traversal of the Substrate Array, one رتلة at a time |
| `02_motif_mining_mathani.md` | `motif-mining` | Machine discovery of repeated contours (مثاني) |
| `03_proximity_axis_routing.md` | `proximity-routing` | Routing along the grammatical proximity axis |

## [Runway]

قرآن is the pillar of the recited text in motion: it isolates everything the
three architectures do to navigate, mine, and route the Substrate Array as
recitation rather than as object. Its three cross-planes are operational
recitational navigation, motif mining of the مثاني, and proximity axis
routing. Every file here must earn its place by moving a reader through the
text, never by describing the text from outside.

## [Excavator]

- **[R1] `README.md`** — the governing constraint (ما نَفِدَتْ كَلِمَاتُ اللَّه) and the Layers 0–4 pipeline layout.
- **[R1] `app.html`** — the navigator in four modes; the primary recitational surface.
- **[R1] `doc.html`** — رَتْلًا وَتَرْتِيلًا, the formalism the pillar is named by.
- **[R2] `src/lib/engine/motifs.ts`** — the مثاني miner: suffix automaton over the person×tense contour alphabet.
- **[R2] `src/lib/isnad.ts`** — `findSeams` and `DISTANCE_OF`: the proximity axis in code.
- **[R2] `src/components/navigator.tsx`** — the studio's navigation surface.
- **[R3] `lib/engine/reader.ts`** — the reading procedure as executable engine.
- **[R3] `lib/engine/timeline.ts`** — movement through the substrate over time.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Common locus addressing | Segments at `(sura, aya, word, seg)` in `corpus.py` | `locusKey` (`surah:ayah`) and `LocusJoin` in `src/lib/cosmos/locus.ts` | Passages and teleport targets in `lib/engine/passage.ts`, `teleport.ts` | All three must resolve a locus to the same Substrate Array coordinates, or navigation cannot be compared. |
| Contour alphabets | rasm n-gram formula index in `sabab.py` (`sigha`) | Twelve-symbol person×tense alphabet in `src/lib/engine/motifs.ts` | Pattern functions root→word in `lib/engine/patterns.ts` | The three definitions of "sameness" — rasm-equality, contour-equality, pattern-equality — must be inter-checkable on shared passages. |
| Distance semantics | قُرْب decay per āyah (`generate.py`: `NEAR_DECAY`) | Person-axis distance (`DISTANCE_OF` in `src/lib/isnad.ts`) | Addressable ring order (`spec/03-order.md`) | "Far" must be mutually convertible: āyah-distance, person-distance, and ring-distance need a shared scale. |
