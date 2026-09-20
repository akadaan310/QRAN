# Canvas Bounds — The Borderless Fifteen-Line Matrix

## Overview

The canvas is a single immutable rectangle holding fifteen addressable lanes of Substrate Array text, with no frame, header, button, or label drawn anywhere on it. Every dimension inside that rectangle is computed, not decorated: lane height, gutter depth, and the two flanking margin channels all derive from live Rigidity Coefficient and Attribution Vector values rather than fixed CSS. The rectangle itself never resizes, scrolls its own edges, or reflows around content — only its interior breathes.

## The Immutable Rectangle

The outer bound is fixed at load and never deforms for the rest of the session: no zoom rescales it, no gesture stretches it, no mode transition changes its aspect. Total interior height `H` is a single constant computed once from the viewport's safe-drawing area (device height minus the platform's own status and gesture-reservation strips) and held exactly through every subsequent transformation. Width is the full safe-drawing width; there is no maximum content width, no centered card, no visible edge — the rectangle is coextensive with the display itself.

## The Fifteen Lanes

Lanes are numbered 1–15 top to bottom and this ordering is the one absolutely sacred coordinate in the system: lanes never reorder, never swap, never animate past one another. Each lane's *height* is fluid and computed per frame from its own Rigidity Coefficient reading; each lane's *sequence position* is frozen. A lane's identity is therefore entirely positional — the fifteenth slot from the top is always lane 15, regardless of how much vertical space it currently claims.

## The Fourteen Seams

Between consecutive lanes sits a seam: inert, near-zero height at rest, and the sole surface on which the multi-speed pressure gestures act (see `03_tactile_interaction.md`). A seam belongs to no lane; it is shared infrastructure, addressed as `seam(n, n+1)`. Seam height contributes to `H` and is accounted for in the same equilibrium pass that redistributes lane height, so a fully engaged seam still leaves the outer rectangle untouched.

## The Margin Void

Two channels flank the fifteen lanes, left and right, each the same fixed width for the whole session. No Substrate Array text — no letter of any kind — is ever permitted inside a margin channel; the void carries only the non-textual telemetry marks specified in `02_telemetry_hud_rails.md`. Margin width is proportioned so that the smallest tick and the largest anchor dot both remain legible on the smallest supported display, and is never adjusted to make room for content, because no content is ever placed there.

## Equilibrium Math

Every frame in which any lane's Rigidity Coefficient changes, the canvas runs the same three-step pass: measure each lane's raw claim against its coefficient, sum the claims against the constant `H`, and redistribute any surplus or deficit across the lanes furthest from claiming attention right now. A lane's height therefore never depends only on its own state — it depends on the state of all fifteen lanes simultaneously, which is what keeps the rectangle's outer edge motionless while its interior visibly shifts weight. A single sacred floor height applies to every lane regardless of how little it currently claims, so no line is ever compressed past legibility; deficits that cannot be absorbed there propagate to the next-quietest lane instead.

## Depth Axis

Beyond the two-dimensional lane grid, each lane additionally carries a z-position derived from its Rigidity Coefficient, giving the rectangle a shallow third dimension used by the depth-of-field rules in `01_typographic_physics.md`. This axis never changes the rectangle's on-screen footprint — depth is rendered as scale, sharpness, and cast-shadow within the existing bound, never as literal movement outside it. The rectangle stays a rectangle; only what appears to stand forward or recede within it changes.
