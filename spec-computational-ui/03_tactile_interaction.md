# Tactile Interaction — Gesture Dictionary, Multi-Speed Transforms, Trace Locks

## Overview

Every control on the canvas is a touch or a key, never a button, and each one acts directly on the Substrate Array or on the geometry surrounding it rather than opening a labeled menu of choices. Gestures come in two families: those that move the reader's focus along or across the fifteen lanes, and those that reshape the whole canvas between its flat, deep, and orbital geometries. A trace lock is the one state that changes what a gesture means rather than what it does, holding forward motion still until the reader's own hand retraces the path that engaged it.

## The Two Gesture Families

Locus gestures move attention: they change which lane holds forward depth, which span is scaled toward the reader, which Attribution Vector is being followed. Geometry gestures move the canvas itself: they interpolate the fifteen lanes' arrangement between the flat linear layout of `00_canvas_bounds.md`, a deep vertical connection web, and a non-linear orbital grid, without touching which lane holds which text. A single touch or keypress belongs to exactly one family at a time; the canvas never asks a gesture to do both at once, so a reader's hand always knows which kind of change it is producing.

## Locus Gesture Dictionary

| Gesture | Surface | Effect |
|---|---|---|
| Single tap | A lane | Sets that lane as forward focus; its Attribution Vector's endpoint becomes the one the depth-of-field rules in `01_typographic_physics.md` track. |
| Tap and hold | A lane | Previews forward focus without committing it — depth shift begins easing in, but reverses on release rather than settling, so a reader can scan candidates before choosing. |
| Vertical drag | A lane's own surface | Steps focus lane by lane along the fixed 1–15 sequence in the drag's direction, one step per crossed seam, continuous rather than paginated. |
| Double tap | A single letterform or word-cluster | Opens that word's own depth layer (the ✦ condition from `02_telemetry_hud_rails.md`) if one exists for it; no-op otherwise. |
| Two-finger tap | A lane carrying a resolved closure | Opens the root-level layer (❖) for that lane's dominant structure, when one exists. |
| Drag from a rail dot to a lane | Either margin channel to the text region | Draws a temporary connecting thread (per the Non-Covering Law) and, on release over a lane, moves forward focus there — this is the sole gesture that starts on a rail rather than on text. |
| Swipe along the compass glyph (◍) | The compass tap target | Opens the full-corpus locus overview; a single further tap on any represented opening selects it as the new seed and closes the overview. |

## Multi-Speed Velocity Input — Geometry Transforms

The three canvas geometries are poles of one continuous space, not three discrete screens, so the gesture that moves between them is itself continuous: a two-finger vertical pinch (mobile) or a held modifier key plus vertical scroll (keyboard/trackpad) interpolates the fifteen lanes' seam angles and z-offsets in real time, with the gesture's ongoing extension mapped directly to interpolation distance rather than triggering a fixed animation. Releasing the gesture at any intermediate point leaves the canvas at that intermediate geometry rather than snapping to the nearest pole — the three named geometries are recognizable resting shapes the interpolation passes through, not the only shapes it may stop at. A second, orthogonal two-finger rotation (mobile) or a held modifier plus horizontal scroll (keyboard/trackpad) steers the same interpolation toward the orbital pole specifically, since the orbital grid is the one geometry with a rotational degree of freedom the other two poles lack.

Velocity of the driving gesture — not merely its distance — sets how fast the interpolation answers it: a slow, deliberate pinch morphs the geometry at a matched slow rate so intermediate states remain readable, while a fast flick overshoots toward the nearest pole and eases to rest there, exactly as the elastic tension in `01_typographic_physics.md` behaves under a sudden load. No geometry transform ever alters which lane holds which text or reorders the sacred 1–15 sequence; only the seam angles, the per-lane z-offset, and (in the orbital pole) the per-lane rotational placement change. A geometry transform is reversible at every point along its path: the same gesture run in reverse retraces the same interpolation back toward the flat pole, with no separate "reset" surface anywhere on the canvas.

## Trace Locks

A trace lock engages when a reader's gesture follows a real Attribution Vector forward across a long jump — the same closures that emit the invariant-harmonics shimmer are the ones capable of locking. Once engaged, every forward-moving locus gesture is suspended: taps, holds, and vertical drags on lanes ahead of the lock boundary produce no depth change and no focus change, a refusal communicated by the attempted lane's weight briefly failing to rise rather than by any dismissible message. The only gesture the lock still answers is the exact reverse of the one that engaged it — the same drag direction and comparable path reversed, or the same tap sequence retraced backward across the same seams — and only that exact reversal disengages it; a different gesture, however plausible, is not accepted as an exit.

While engaged, the lock itself is visible only through the rails: the locked lane's position marks on both channels hold at elevated opacity rather than fading on the normal idle timer, the one persistent state either rail is permitted to hold. A trace lock never blocks a geometry transform — the two gesture families remain independent even during a lock, so a reader can still morph the canvas's shape while retracing their way out of a locked locus walk. A lock that goes unretraced simply persists indefinitely; there is no timeout, because a citation the reader has not finished following is not abandoned on the system's behalf.

## Dismissal and Reversibility Law

Every mode this file describes — a previewed focus, an open word or root layer, an in-progress geometry interpolation, an engaged trace lock — has exactly one gesture that exits it, and that gesture is always a variant of the same motion that entered it, run in reverse or released rather than confirmed. Nothing on the canvas is ever dismissed by a separate close control, because a close control is itself a label a reader would have to learn independent of the motion they already made. Where two different entries exist for related states (tap-and-hold preview versus committing tap), their exits are likewise related (release versus reverse-retrace) rather than sharing one generic cancel, so a reader's hand always carries enough information to find its own way back out.
