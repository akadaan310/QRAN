# 06 — Deployment Roadmap

> **Runway.** A product this ambitious ships in stages or not at all. This document lays out six stages from a single-page prototype to a universally usable application, each with entry criteria, exit criteria, and deliberate exclusions. It is a plan, not a commencement: the standing gate still governs what gets built.

## Stage 1 — Single-page prototype

Build one page, fifteen lanes, rigid bound, fluid interior. Ship exactly one lens (the substrate lens, F19) and one instrument (the proximity axis HUD, F13). Validate the equilibrium governor's measure → claim → redistribute pass and the non-covering law under real touch.

- *Entry:* canvas geometry and typography rules frozen from the spec-ui blueprint.
- *Exit:* a reader can press the gutter through three speeds and watch the axis marker travel, with the footprint unbroken.
- *Excluded:* all other lenses, orbit mode, locks, sync — deliberately.

## Stage 2 — Instrumented alpha

All twenty features on a small page set. All six HUD states with their transitions. The four signature gestures (lane changes, 3-speed lens, echo-trajectory orbit, rasm reveal) at full fidelity with named dismissals. Internal validation only.

- *Entry:* Stage 1 exit criteria met; gesture dictionary frozen.
- *Exit:* every feature in the interaction matrix is exercisable and reversible; every HUD state is reachable and labeled on the rails.
- *Excluded:* real repository ingestion (use fixture analytics), any persistence.

## Stage 3 — Pipeline integration

Connect the real ingestion pipeline: Repository 3 substrate arrays, Repository 1 and 2 vector overlays, live lane-state publication with provenance chains. Ledger-backed friction and audit values replace fixtures. The invertibility audit becomes the user-facing end of a real lineage.

- *Entry:* pipeline contracts (01) implemented against frozen repository snapshots.
- *Exit:* selecting any typographic effect traces back to repository material; zero-match pages render honestly with no forced lenses.
- *Excluded:* multi-device sync, public release.

## Stage 4 — Universal access

Build the three cognitive pathways into onboarding and beyond: gesture-first, thread-first, and audit-first roads through the same product. Add motor fallbacks for every press-and-hold, low-vision weight/spacing controls, and generous touch targets. Validate the sixty-minute onboarding arc with true novices across all three profiles.

- *Entry:* Stage 3 exit; pathway content authored.
- *Exit:* novices from each profile complete onboarding inside sixty minutes and can name the canvas zones and perform the four signature gestures.
- *Excluded:* sync schema, wide release.

## Stage 5 — Sync and ecosystem

Bring the synchronization engine live: local-first operation log, additive merge for discoveries and checkpoints, debounced navigation state, background flush. Stand up the central schema (relational store or graph ledger) and multi-device convergence. Checkpoint authoring becomes a first-class instrument.

- *Entry:* schema contracts (05) frozen; Stage 4 exit met.
- *Exit:* a reader's discoveries survive session death, travel across devices, and merge without loss or duplication under offline/online cycling.
- *Excluded:* public launch, marketing surface.

## Stage 6 — Universal release

Performance hardening against the runtime targets: gesture response within a frame, eased transitions at their specified durations, offline-first packaging so the page is always a page. Researcher program for deep tracking: lens stacking, convergence overlays, and long-session ergonomics validated with advanced readers. Documentation of the full product for independent review.

- *Entry:* all prior exits met; performance targets measured on target devices.
- *Exit:* a novice onboards in under an hour; a researcher deep-tracks without simplification; both point to the same unbroken page.
- *Excluded:* nothing further — this is the product. Interpretation of the text's meaning remains forever out of scope, by principle, not by stage.

## Standing constraint

This roadmap describes what *would* be built and in what order. It authorizes nothing. The standing gate holds: nothing beyond the UI system moves toward implementation without explicit approval, and each stage's entry criteria must be genuinely met — not declared — before the next begins.
