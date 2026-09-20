# 02 — Runtime Architecture

> **Runway.** The runtime holds one promise: the page never breaks while everything inside it moves. This document specifies how the viewport composes its layers, how the context router matches data velocity to reader velocity, and what the system must guarantee in time and memory. Performance here is not polish; it is the precondition for trust.

## Viewport rendering

The page is a fixed bound containing composited layers, rendered back to front:

1. **Field layer** — the page ground, including axis tint washes.
2. **Substrate layer** — skeleton strokes (always present beneath, revealed fully in rasm state).
3. **Text layer** — the marked Arabic letterforms, the primary visual material.
4. **Thread layer** — filaments, trajectories, and root strands in the gutters.
5. **Depth effects** — lift, blur, and shadow that separate the planes.

**Layout pass (the equilibrium governor).** On any intensity change the governor runs measure → claim → redistribute: measure each lane's claimed height from its intensity, cap total height at the immutable page constant, and distribute reclaimed space to the quietest lanes. No lane may fall below legibility minimum. The pass eases over roughly four hundred milliseconds so expansion reads as a claim, not a glitch.

**Render isolation.** The text layer is never re-rasterized for instrumentation changes; HUD updates composite above it without touching the letterforms. Tint, depth, and thread layers may animate freely; the Arabic text moves only in weight, spacing, and row height per the typography system.

## The Multi-Speed Context Router

One page, three velocities. The router matches data depth to reader velocity, inferred from dwell time, gesture depth, and session stage — never from a settings toggle the reader must remember.

- **Runway track (onboarding velocity).** Noise filtered out: one lens at a time, HUD in spine density, audits hidden behind a single "what did this cost?" affordance. The reader meets structure at walking pace.
- **Excavator track (research velocity).** Deep dependencies parsed and shown: full provenance chains, all nine lenses available for stacking, audits open by default, margin rails at full density. Nothing is simplified.
- **Collider track (comparative velocity).** Multi-repository friction points mapped side by side: the same lane read through two or three repository behaviors at once, with the conflict — not the agreement — foregrounded.

The router shifts tracks automatically as velocity signals change, and always announces the shift on the rail (a brief track glyph) so the reader knows which depth they are at. A reader may pin a track, but the default is responsive.

## Performance targets

- **Gesture response:** every touch produces visible feedback within one frame; no gesture waits on data.
- **Lane breathing:** expansion/contraction eases over ~400ms; never snaps.
- **Orbit transition:** lanes bend into concentric arcs over ~600ms; beacons tick as trajectories land.
- **Rasm dissolve:** marks shrink and fade row by row over ~500ms from the pinch epicenter; healing ripples outward on release.
- **Lock detent:** forward resistance engages within 100ms of boundary contact.
- **Memory:** the runtime holds the current page plus a small window of neighbors; analytics ride with their page and are released with it.
- **Offline posture:** page geometry and precomputed analytics ship with the page. The reader never waits on a network for the page to be a page; synchronization happens around the reading, never inside it.

## State model

Viewport state is a small, explicit record: focused lane, active lenses, HUD density, orbit hub (if any), rasm state, lock state, track (Runway/Excavator/Collider, pinned or auto). This record is what the synchronization engine persists — everything else is derived. A cold start restores the record and recomputes the view from it; there is no hidden state.
