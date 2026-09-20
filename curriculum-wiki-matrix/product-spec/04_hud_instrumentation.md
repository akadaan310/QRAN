# 04 — HUD Instrumentation

> **Runway.** The margins are instruments, and instruments need calibration. This document specifies each rail's cells, the thresholds that drive their readouts, and the six states the heads-up display moves through. Above all it enforces the non-covering law: no metric ever touches the letterforms.

## Rail calibration

**Left rail — position and resistance.**

- *Proximity index ticker.* Each cell carries a miniature three-pole axis (address / speaker / absent) with a marker at the lane's blend. Marker jumps beyond a calibrated threshold pulse once — the system flags perspective shifts before conscious registration. Threshold is set per page from the lane-axis variance, so "sudden" is always relative to the page's own calm.
- *Rigidity rail.* A spine of ticks per cell: dense for structurally rigid lines, sparse for fluid ones. Density bands are fixed (five bands); assignment uses the lane's rigidity coefficient quintile on the page.
- *Timeline checkpoints.* Shallow boundaries render as dots; deep boundary layers as bars. A bar's glow begins two lanes before contact and intensifies with proximity — fair warning, physically felt.

**Right rail — relation and measure.**

- *Attribution vector list.* One compact glyph per link type touching the lane. Tapping a glyph highlights its thread in the substrate without leaving the page. Glyphs are ordered by weight, capped per cell; overflow is indicated, never crammed.
- *Friction meter.* Per-lane micro-bars of the aggregated friction coefficient, scaled to the page maximum so bars are comparable within the page. Bars update live on lens change. Tapping isolates the hottest span.
- *Depth cursor.* Follows margin scrub; the cursor's lane lifts, the rest settle. The cursor is the reader's hand in depth.
- *Breath indicator.* A hairline gauge of claimed versus free space budget — the governor's only visible element.

**Cell alignment law.** Margin cell *n* always describes lane *n*, in every state, at every density. If a rail cannot show all fifteen cells (spine density), it shows a compressed spine with the focused lane's cell expanded — never a misaligned one.

## The six HUD states

| State | Entry | Rail appearance | Exit |
|---|---|---|---|
| Rest | seconds without interaction | instruments dim to ticks-only at 40% | any touch → Tracking |
| Tracking | focus moves between lanes | proximity markers glide, friction bars update live | stillness → Rest |
| Locked | deep chronological boundary crossed | lock glyph on the boundary cell, checkpoint illuminated, forward instruments grayed | anchor recovered → Tracking (with release signal) |
| Lens | gutter press active | depth indicator shows speed 1/2/3, neighboring cells brighten | release → Tracking |
| Orbit | echo-trajectory engaged | orbital ring replaces depth cursor, beacons ticked as trajectories land | outward fling → Tracking |
| Rasm | skeleton revealed | rails dim to minimal ticks; contemplative state | spread to heal → Tracking |

Transitions are eased and narrated by the rails themselves — pulses, glides, and glows are the vocabulary. There are no popups, banners, or modal dialogs on the margins, ever.

## The non-covering law

Instrumentation lives on the rails; content lives on the lanes. No HUD element may overlap, occlude, or re-tint the Arabic letterforms. Thread filaments and trajectory arcs travel through gutters and margins only — where a thread must cross a lane, it passes *behind* the text layer at reduced opacity, never over it. In rasm state the law tightens further: the rails withdraw to minimal ticks and the skeleton is contemplated, not instrumented.

## Calibration governance

Thresholds (jump detection, rigidity bands, glow proximity, friction scaling) are calibrated per page from that page's own distributions — the HUD is always relative to the page in view, never to a global absolute. Calibration values are inspectable: a long-press on any rail cell reveals the threshold behind its readout. The instrument never asks for trust it will not itemize.
