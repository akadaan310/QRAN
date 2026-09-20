> **[Cross_Plane_Layer]:** `proximity-routing`
> **[Core_Pillar]:** قرآن — Qur'an
> **[Unified_Dependency]:** Attribution Vectors → Rigidity Coefficient → Locus Coordinates

# Proximity Axis Routing

## [Runway]

Proximity axis routing places every discourse referent on a measured axis from
direct address to absence and routes traversal along that axis. Isnād Studio
fixes the axis explicitly: المخاطب at zero, المتكلم at one half, الغائب at
one, with seams scored by how far the attribution travels. For this pillar,
routing is therefore grammatical before it is spatial: the distance a reading
moves is the distance the attribution moves, and the Rigidity Coefficient is
what keeps the line from drifting while it does.

## [Excavator]

- **[R2] `src/lib/isnad.ts`** — `findSeams`, `DISTANCE_OF`: seams where the attribution chair changes hands, scored by person-axis distance.
- **[R2] `README.md`** — the proximity axis table: المخاطب 0, المتكلم 0.5, الغائب 1; direct address is the nearest a discourse can stand.
- **[R2] `src/lib/engine/detectors.ts`** — `istihdar` (a party spoken of in absence, then direct address within a few words); `jisr-al-naba`; `tabaqat-al-isnad`; `DEFAULT_OPTIONS` windows (`stitchWindow`, `echoWindow`).
- **[R1] `generate.py`** — قُرْب scoring: `ADJACENT`, `NEAR_BASE`, `NEAR_DECAY` per āyah of distance, `NEAR_SPAN`, `CROSSING` toll — proximity as a priced quantity.
- **[R3] `packages/spatial/index.ts`** — the spatial package (+ test suite).
- **[R3] `lib/engine/timeline.ts`** — ordered traversal substrate.
- **[R3] `spec/03-order.md`** — the alphabet as an addressable ring: order as coordinate system.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Distance semantics | قُرْب decays per āyah of distance; crossing the sūrah pays a toll | `DISTANCE_OF` measures person-axis travel between المخاطب and الغائب | The addressable ring gives every letter a position; spatial package models relations | Forces one shared notion of "far": āyah-distance, person-distance, and ring-distance must be mutually convertible before routes can be compared. |
| Seam detection | `wasl` / `aks` attachment operations stitch and reverse citation-sequences | `istihdar`, `jisr-al-naba`, `tabaqat-al-isnad` detect attribution seams structurally | `spec/07-segment.md`: the chunk profile is a signature independent of the letters | Forces seams to be detectable by all three: an attribution seam should also be a segmental seam candidate, or the seam is an artifact of one lens. |
| Routing surface | `navigator.html`, `rukub.html` voyage surfaces | `rihla.tsx` voyage; `locus.ts` joins every finding to a placed node | `Teleport.tsx`, `TimeTravel.tsx`, `timeline.ts` | Forces Locus Coordinates to be the common address: every route, in every architecture, must resolve to `(sūrah, āyah, span)`. |
