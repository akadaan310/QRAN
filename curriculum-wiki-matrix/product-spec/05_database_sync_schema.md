# 05 — Database Sync Schema

> **Runway.** A reader's discoveries must outlive the session, travel across devices, and never corrupt. This document defines the centralized schema — discoveries, checkpoints, navigation states, sessions — and the synchronization engine that keeps a local-first log merged without loss. Writes are debounced where they can be and immediate where they must be.

## Entities

**Discovery.** A cross-plane finding the reader chose to keep: the lane (1–15), the page identifier, the active lens, the friction coefficient at capture, the audit reference (superposition → survivors → loss), a free note, and creation time. Discoveries are never edited in place — a correction is a new discovery linked to the old one, so the record shows its own thinking.

**Checkpoint.** A custom timeline marker authored on the margin track: lane, page, author label, an optional note, and the boundary depth it marks (shallow or deep). Checkpoints are first-class instruments — once authored, they participate in lock behavior and glow like native ones.

**NavigationState.** The restorable viewport record: focused lane, active lens stack, HUD density, orbit hub (word position and page, if any), rasm on/off, track (Runway / Excavator / Collider, pinned or auto). Small, explicit, complete — a cold start rebuilds the view from this alone.

**PageSession.** A reading session on a page: page identifier, track used, duration, deepest lens speed reached, locks encountered and resolved, discoveries count. Sessions are analytics for the reader's own reflection, never scored or ranked.

## The Universal State Synchronization Engine

**Local-first.** Every change is written to the on-device log first and acknowledged to the reader instantly. The network is never in the interaction path — synchronization happens around the reading, never inside it.

**Operation log, not state overwrite.** The device keeps an ordered log of operations (add discovery, author checkpoint, update nav state). Sync ships log entries; the center merges them. If the network fails, the log waits; nothing is lost and nothing is half-written — entries are checksummed and applied atomically or not at all.

**Merge rules.** Discoveries and checkpoints are additive: concurrent authorship on two devices merges by union, never by deletion. NavigationState uses last-writer-wins per field with timestamps, so a phone and a tablet converge instead of fighting. Deletes are soft and reversible for a full cycle before compaction.

**Write pacing.** NavigationState writes are debounced — the engine waits for stillness before persisting, so a long orbit session produces one record, not hundreds. Discoveries and checkpoints write immediately; a reader's authored work is never held hostage by a timer. Background flush drains the log whenever connectivity allows, oldest first.

**Integrity.** Every record carries a checksum; every sync round is verified before the local log is trimmed. A failed verification replays from the last verified point. The engine would rather re-send than doubt.

## Central schema mapping (Notion-style relational model)

The center is a relational store — described here against a Notion-like model, with an active graph ledger as the alternative:

- **Discoveries database.** Properties: page reference, lane (number 1–15), lens (select from the nine), friction (number), audit reference (text: superposition → survivors → loss), note (text), created (time), supersedes (relation to Discoveries, for corrections).
- **Checkpoints database.** Properties: page reference, lane, label (text), note (text), depth (select: shallow / deep), authored-by track (select), created (time).
- **Sessions database.** Properties: page reference, track (select), duration, deepest lens speed, locks encountered, locks resolved, discoveries count.
- **NavigationState store.** A single per-device record holding the restorable viewport fields; history kept as a short ring, not an infinite log.

**Graph ledger alternative.** The same four entities map to nodes; relations (supersedes, authored-during, resolved-at) map to typed edges. The merge rules are unchanged — only the storage shape differs. Either center must satisfy the same contract: additive merge for authored work, timestamped convergence for nav state, atomic verified application, and full offline operation.

## What sync never does

It never reorders the reader's discoveries, never silently drops a checkpoint, never blocks the viewport on a network call, and never sends the Arabic text content itself — only positions, values, and the reader's own annotations travel. The text stays where it belongs: on the page.
