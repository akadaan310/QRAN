> **[Cross_Plane_Layer]:** `motif-mining`
> **[Core_Pillar]:** قرآن — Qur'an
> **[Unified_Dependency]:** Substrate Array → Attribution Vectors

# Motif Mining (مثاني)

## [Runway]

Motif mining is the discovery of repeated contours — مثاني — in the Substrate
Array, found by the machine rather than posited by the reader. Isnād Studio
reduces the muṣḥaf to a string over a twelve-letter alphabet of person-by-tense
symbols and runs a suffix automaton to yield every right-maximal repeated
contour with no ceiling on length. For this pillar, a مثنى counts only when it
is computed from morphology and attested in the text, which is what lets motif
mining serve recitation instead of decorating it.

## [Excavator]

- **[R2] `src/lib/engine/motifs.ts`** — the مثاني miner: suffix automaton; twelve-symbol alphabet (person × tense); `encodeContour` / `decodeContour`; "the interesting مثاني are not the ones we thought to look for."
- **[R2] `data/index/motifs.json`** — the shipped motif index; served by `src/app/api/motifs/route.ts`.
- **[R2] `src/lib/engine/detectors.ts`** — `raj-al-jidhr`: a root returning across a person, voice, or quotation boundary.
- **[R1] `sabab.py`** — `takrar` (تكرار لفظي: same lemma or root elsewhere), `tamathul` (تماثل تركيبي: shared POS pattern), `sigha` (صيغة مشتركة: shared formula across every width).
- **[R1] `edges.json`** — the shipped Attribution Vectors the navigator traverses.
- **[R3] `lib/engine/patterns.ts`** — a pattern as a function from root to word; `abstractWord`.
- **[R3] `spec/13-pattern.md`** — the Pattern layer; **`spec/15-symmetry.md`** — fixed points under every transformation.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Contour alphabet | Formula index over rasm word sequences (`sabab.py`: `sigha`, n-gram widths 2–4) | Twelve-symbol person×tense alphabet mined by suffix automaton (`motifs.ts`) | Pattern functions root→word; symmetry fixed points (`patterns.ts`, `spec/15`) | Forces a shared definition of "sameness": rasm-equality, contour-equality, and pattern-equality must be inter-checkable on the same passages. |
| Attestation | `jam()` is admissible only if the union is attested as a cluster in the muṣḥaf | Every detector reports a structural configuration present in the morphology; none interpret | Layer Contract: accounted loss and hand-verifiability; a failing layer is cut | Forces every claimed motif to carry attestation evidence in a form the other two architectures can re-derive independently. |
| Index integrity | `edges.json` ships the navigator's precomputed vectors | `motifs.json` ships the motif index — which carries five dangling `mirrorOf` references (verified 2026-09-19) | `scripts/build-artifact-data.mjs` ships the artifact data bundle | Forces cross-verification of shipped indexes: each architecture must be able to audit the others' precomputed Attribution Vectors, dangling references included. |
