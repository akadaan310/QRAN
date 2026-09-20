# Unified Nomenclature System

The global vocabulary of the matrix. Every structural file in
`02_structural_cross_planes/` is written in these five terms; local
repository terms are retired from new prose.

## The five global equivalents

### 1. Substrate Array
- **Replaces:** base text objects — muṣḥaf corpus, `corpus.txt`, `ayaat.json`, `words.json`, segments, `surahs.json`, skeletons, lexicon tables.
- **Definition:** the addressable text mass everything else operates on: letters, segments, words, āyāt, sūrahs, and their indexes. The substrate is always Arabic-first and always countable.
- **Primary pillars:** قرآن, قرآناً عربياً, عربي.

### 2. Attribution Vectors
- **Replaces:** relational links / isnād paths — edges, سبب generators, seams, strands, fawātiḥ clusters, motifs, discoveries, resonances.
- **Definition:** directed, typed relations between Substrate Array positions. A vector always carries its type and its evidence: what kind of link it is and what attests it.
- **Primary pillars:** قرآن, قرآناً عربياً.

### 3. Rigidity Coefficient
- **Replaces:** continuity metrics — `lexicalContinuity × isnādDelta`, رِباط, chunk profiles, وَزْن / قُرْب scores, collapse survival rates.
- **Definition:** a measure of how much structure holds still while something else moves. High rigidity means the line stayed put while the grammar, the reading, or the traversal moved around it.
- **Primary pillars:** قرآناً عربياً, حكماً عربياً.

### 4. System Invariants
- **Replaces:** layer mechanics / operator rules — `ops.py` acts, the eight detectors, layer operations, collapse filters, the Layer Contract, admissibility modes.
- **Definition:** the admissible operations of the system and the quantities they cannot change. An invariant is earned by surviving every admissible transformation, never by assertion.
- **Primary pillars:** عربي, حكماً عربياً.

### 5. Locus Coordinates
- **Replaces:** stations / movements — locus, voyage, rihla, teleport, timeline, navigator modes, placement, coverage.
- **Definition:** address plus movement. A locus is where a reading stands — sūrah, āyah, word span — and a coordinate system must also carry the voyage: how a reading travels from one locus to the next.
- **Primary pillars:** قرآن, قرآناً عربياً.

## Usage rules

1. **New prose uses global terms only.** No exceptions in Runway or Collider tiers.
2. **Local terms are quarantined to Excavator hooks**, where they must appear as exact repository paths, and to parenthetical first mentions inside pillar definitions.
3. **Every structural file declares its `[Unified_Dependency]`** as a chain of global terms (e.g. `Substrate Array → Attribution Vectors → Locus Coordinates`), naming what the concept is built from.
4. **The four pillar names are Arabic-first anchors** (قرآن، قرآناً عربياً، عربي، حكماً عربياً) and are never translated or replaced.
5. **Retired on sight:** "base text objects", "relational links", "isnād paths" (as generic), "continuity metrics", "layer mechanics", "operator rules" (as generic), "stations", "movements" — each must be rewritten in the global equivalent before a file is accepted.
