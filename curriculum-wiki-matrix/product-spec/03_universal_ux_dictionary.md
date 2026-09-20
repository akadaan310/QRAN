# 03 — Universal UX Dictionary

> **Runway.** Every reader arrives with a different mind, and the dictionary must speak to all of them without forking the product. This document maps the complete gesture vocabulary, the interaction flows for the four signature mechanics, and the typography rules that make structure visible. It then shows how three cognitive profiles — visual-physical, relational-narrative, systems-logical — travel from arrival to deep tracking on their own roads.

## Gesture dictionary

Every gesture is reversible; every mode names its dismissal. Fallbacks ensure no capability is gesture-exclusive.

| Gesture | Context | Effect | Dismissal / fallback |
|---|---|---|---|
| Tap lane | any | Focus: lane lifts slightly, HUD tracks it | Tap elsewhere; keyboard/switch focus fallback |
| Tap seam | split row | Merge the sub-rows back into one lane | — |
| Long-press gutter (light) | gutter | Lens speed 1: hidden connections surface | Release |
| Firm press gutter | gutter | Lens speed 2: skeletal variants show through | Release |
| Deep press gutter | gutter | Lens speed 3: root continuity threads illuminate | Release |
| Double-tap word | lane text | Echo-trajectory: beacons rise, filaments draw, orbit mode | Outward fling from hub; double-tap hub |
| Drag | orbit mode | Rotate the orbit around the hub word | — |
| Tap beacon | orbit mode | Jump focus to that occurrence, thread trails behind | — |
| Scroll / swipe | page | Advance through lanes | — |
| Boundary contact | deep timeline layer | Detent: forward motion resists, lock glyph appears | — |
| Reverse-drag | locked state | Re-walk the trail backward; ghosts dissolve; anchor recovered | Forward unlock is automatic on anchor recovery |
| Multi-finger pinch inward | across rows | Rasm reveal: marks dissolve row by row, skeleton on gray | Spread fingers to heal; two-finger spread fallback |
| Scrub margin rail | rail | Move the depth cursor across lanes | Lift finger |
| Tap margin cell | rail | Isolate the lane | Tap again to release |
| Tap margin bar | friction meter | Isolate the lane's highest-friction span | Tap again |
| Pinch margin | rail | Cycle density: spine / expanded / full | — |
| Long-press checkpoint | timeline rail | Preview the boundary layer | Release |
| Two-finger tap rail | rail | Toggle passivity lens | — |

## Signature interaction flows

**15-vector lane changes.** Focus moves to a lane → the lane's five state values are read → weight, spacing, height, and depth ease to their new values over ~400ms → the governor redistributes space change to the quietest lanes → the breath indicator on the rail reflects the new space budget. The reader perceives a claim being made and paid for.

**3-speed substrate lens press.** Finger enters a gutter → light pressure draws filaments between the neighboring lines → increasing pressure cross-fades to the skeletal underlay → deep pressure raises the vertical root strands → the rail's depth indicator shows 1/2/3 throughout → release reverses the sequence exactly. Each speed has a distinct visual language so the reader always knows their depth.

**Echo-trajectory orbital navigation.** Double-tap a word → pulse ring → beacons rise on matching lines → filaments draw nearest-first, ticking the rail → on final arrival, lanes bend into concentric arcs around the hub → scroll suspends, drag rotates, beacons jump with trailing threads → outward fling relaxes arcs back to parallel lanes. Navigation has become radial; the return path was never lost.

**Multi-finger rasm reveal.** Pinch inward across rows → marks shrink and fade from the epicenter outward over ~500ms → skeleton stands near-black on clean gray, rails dim to minimal ticks → free exploration (pan, dwell, trace) → spread fingers → marks heal back dot by dot with ripples from the release point, each landing where the skeleton dictates. Substrate independence, witnessed physically.

## Typography rules (summary)

Full system in `spec-ui/05_typography_system.md`. In brief: weight follows intensity; letter spacing expands with viewpoint-axis travel and contracts on quiet lines; row height follows the zero-sum economy with a sacred legibility minimum; friction maps to z-lift with depth-of-field separation; splits fork within the lane's own height budget; the rasm canvas shows pure structure. The Arabic letterforms are never reduced or replaced in any state.

## Universal access pathways

**Visual/Physical minds** travel by gesture and space. Arrival emphasizes the pinch, the press, and the orbit; the HUD is taught as spatial landmarks ("the glow means a boundary is near"). Intermediate work is trajectory-first: they navigate by relation before they can name the relations. Deep tracking for this profile is kinesthetic — they feel locks coming and read depth the way others read labels. Motor fallbacks: every press-and-hold has a tap-toggle equivalent; orbit rotation accepts edge-swipe; all targets meet generous touch sizing.

**Relational/Narrative minds** travel by connection and story. Arrival leads with echo-trajectories ("follow the thread") and rollback ("go back to where it turned"). The collapse lens is taught as "what the story cost"; convergence as reunion across distance. Intermediate work is thread-first: they hold several trajectories in mind as a cast of relations. Deep tracking is narrative archaeology — checkpoint authoring becomes chapter-marking their own investigation.

**Systems/Logical minds** travel by number and rule. Arrival starts at the friction meter and the rigidity rail: structure as measurement. They open audits unprompted, respect the equilibrium governor as a conservation law, and learn the HUD states as a formal taxonomy. Intermediate work is audit-first: every key gets priced before it gets trusted. Deep tracking is formal verification by hand — lens stacking as controlled experiment, with refused combinations read as informative, not broken.

**Shared guarantees across profiles.** No profile is ever locked out of another's road — the pathways differ in emphasis, never in capability. Low-vision readers get weight/contrast scaling and spacing controls that never alter the letterforms' identity. The sixty-minute onboarding arc adapts its examples to the profile but keeps its four beats: page-as-page, first lens, first shift, first skeleton.
