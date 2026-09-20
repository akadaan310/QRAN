# Telemetry HUD Rails — Icon-Only Margins and Coordinate Ticks

## Overview

The two margin channels established in `00_canvas_bounds.md` are instrument panels with no instrument names on them: everything they show is a mark, never a word, never a number outside a traditional ayah end-marker. Position along a rail encodes locus, mark density encodes structure, and opacity encodes how much the reader's attention currently warrants seeing it. A margin that has nothing to report is not empty of ink so much as reduced to its quietest possible state, because a rail is never allowed to disappear entirely — only to go still.

## The Two Channels

The left channel is the position channel: it reports where each lane's Attribution Vector currently sits between the two poles of address, and how rigid the lane's structure is against the pressures acting on it. The right channel is the relation channel: it reports which typed vectors touch each lane, how much of the shared height budget that lane is claiming, and where the reader's own touch currently rests in the depth axis. Nothing a channel reports ever crosses to the other side, and a mark's horizontal position — strictly left or strictly right of the text — is itself part of what it communicates, before its shape is even read.

## Tick Taxonomy

A hairline tick reports structure at rest: a short tick marks a lane whose Rigidity Coefficient is currently low, a tall dense cluster of ticks marks a lane holding firm against strain, and the transition between the two is continuous rather than stepped, matching the coefficient's own real-time value rather than a rounded category. A dot marks a discrete event rather than a continuous quantity — a vector's endpoint, a closure, a place the reader has marked by hand — and a dot's size is fixed while its opacity varies, so an old or distant event is still visible, only quieter. Nothing on either rail is ever rendered as a printed digit; where a traditional count would once have been shown, the tick's own length or the dot's own position carries that information geometrically instead.

## Anchor Dots and Touch Proximity

Every dot on either rail continuously senses the reader's pointer or finger and brightens smoothly as the touch approaches it, reaching full opacity only at direct contact and fading back to its resting opacity the moment contact ends or moves away — this is the rail's only concession to interactivity that isn't itself a gesture trigger, a form of ambient acknowledgment rather than a control. Dots never move to meet a touch; only their opacity travels. A cluster of dots close enough together that individual proximity brightening would blur into a single mass instead brightens as one unit, so the rail never produces an illegible smear under a fast-moving touch.

## The Sacred Glyph Canon on the Rails

Eight fixed glyphs — ✦ ❖ ◈ ◉ ⬔ ◐ ◍ ✧ — are the only marks on either rail permitted to carry a tap target rather than being purely observational, and each appears only where its condition is actually true for that lane: ✦ where a word-level depth layer exists to be entered, ❖ where the lane's dominant root has its own layer, ◈ where the lane anchors a path a reader can walk, ◉ where the lane carries a direct address, ⬔ where a lane sits inside one of the thirty marked fields, ◐ as the single rasm toggle shared by the whole canvas rather than repeated per lane, ◍ as the single compass entry shared by the whole canvas, and ✧ as the single compose entry anchored to wherever the reader's focus currently sits. A glyph that has no true condition for a given lane is simply absent from that lane's rail cells — never grayed out, never shown disabled, because a disabled mark is still a label about what is missing.

## Locus Without Numerals

A lane's address — which sūrah, which āyah, which span — is never printed on the rail in any form. Where the reader needs to know a locus has been reached rather than merely approached, the confirmation is the traditional ayah end-marker already present in the Substrate Array text itself, which is Quranic and therefore exempt from the wordless law rather than an exception to it. The compass glyph (◍) is the sole surface where many loci are represented at once, and there they are represented by the opening text of each sūrah and by segment boundaries alone — never by a printed sūrah number, juz number, or page number.

## Non-Covering Law

No mark on either rail is ever permitted to extend past the margin channel's inner edge into the region where Substrate Array text renders, under any state, at any opacity, including mid-transition between states. Where a relation must visually connect a rail mark to a specific letter span, the connecting thread is drawn beneath the text layer's rendering order and dims to a fraction of its rail opacity as it crosses under a letterform, so it is always inferable but never competes with the glyph above it. This law has no exception state; there is no reader action that suspends it, because the letterforms are the one thing on the canvas the rails exist to serve, never to obscure.
