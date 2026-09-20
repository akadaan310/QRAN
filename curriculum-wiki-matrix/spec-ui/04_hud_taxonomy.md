# Peripheral HUD Taxonomy

The margins are an operating track, not decoration. Every instrument below
lives on the rails, aligned per line: margin cell *n* always describes lane
*n*. Content never enters the margins; instrumentation never covers the
letterforms.

## Instruments

**Proximity Index Ticker (left rail, F13).** Each cell shows its lane's
position on the three-pole axis — address / speaker / absent — as a marker
on a miniature axis. Sudden marker jumps are flagged with a brief pulse: the
system notices perspective shifts before the reader does.

**Rigidity Rail (left rail, F12).** A vertical spine of ticks per cell: dense
ticks mark structurally rigid lines that will resist manipulation; sparse
ticks mark fluid lines. The reader learns, at a glance, where the page has
hard and soft ground.

**Timeline Checkpoints (left rail, F16).** Chronological boundary markers.
Shallow boundaries show as dots; deep boundary layers — the kind that trigger
the Inverse Path-Trace Lock — show as bars with a glow that intensifies as
focus approaches. The rail gives fair warning.

**Attribution Vector List (right rail).** The typed relational links touching
each lane, rendered as compact glyphs (one per link type). Tapping a glyph
highlights the thread in the inter-row substrate without leaving the page.

**Friction Meter (right rail, F10).** Per-lane micro-bars of the aggregated
friction coefficient. Bars breathe live as lenses change what counts.
Tapping a bar isolates the lane's highest-friction span.

**Depth Cursor (right rail, F18).** Scrubbing the rail moves a cursor across
lanes; the cursor's lane lifts slightly, the rest settle. The cursor is the
reader's hand in the depth dimension.

**Breath Indicator (right rail, F20).** A hairline gauge showing how much of
the page's fixed space budget is currently claimed by high-intensity lanes.
The only visible element of the equilibrium governor.

## HUD states

| State | Trigger | What changes on the rails |
|---|---|---|
| Rest | No interaction for a few seconds | All instruments dim to 40%; ticks only |
| Tracking | Focus moves between lanes | Proximity markers glide; friction bars update |
| Locked | Chronological boundary crossed (F16) | Lock glyph on the boundary cell; checkpoint illuminated; forward instruments grayed |
| Lens | Gutter press active (F19) | Depth indicator shows speed 1/2/3; neighboring cells brighten |
| Orbit | Echo-trajectory engaged (F15) | Orbital ring replaces the depth cursor; beacons ticked as trajectories land |
| Rasm | Skeleton revealed (F17) | Rails dim to minimal ticks; contemplative state |

## Taxonomy rules

1. One instrument, one job. No cell shows two metrics at once; density modes
   (spine / expanded / full) change how many cells are visible, never how
   much a cell carries.
2. The HUD narrates, never interrupts. Pulses and glides are the vocabulary;
   there are no popups, no banners, no modal dialogs on the rails.
3. Every HUD element is also a control. Readouts are touch-active: tap to
   isolate, scrub to move, long-press to preview.
4. In Rasm state the HUD withdraws by law — the skeleton is contemplated,
   not instrumented.
