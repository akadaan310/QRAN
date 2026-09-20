> **[Cross_Plane_Layer]:** `text-alignment`
> **[Core_Pillar]:** قرآناً عربياً — Qur'anan Arabiyyan
> **[Unified_Dependency]:** Substrate Array → Rigidity Coefficient

# Continuous Unmediated Text Alignment

## [Runway]

Continuous text alignment is the practice of stacking raw text against raw
text so that distant coordinates stitch into one unbroken layer, with
apparatus confined to the margin. al-Mirtāl states this as its governing
constraint — nothing stands between one رتلة and the next but the text
itself — and implements it in the wasl, hamal, and ihata operators. For this
pillar, alignment is a property of the Substrate Array under operation, not
an annotation laid over it: the Rigidity Coefficient is high exactly where
the text holds itself together without mediation.

## [Excavator]

- **[R1] `README.md`** — the governing constraint (ما نَفِدَتْ كَلِمَاتُ اللَّه); the method of the pre-textual compilers: distant coordinates stitched into one continuous layer.
- **[R1] `ops.py`** — `wasl` (stitch), `hamal` (carry across a stop), `aks` (reverse attachment), `ihata` (enclose by repetition): the alignment operators.
- **[R1] `doc.html`** — رَتْلًا وَتَرْتِيلًا: the formalism of unmediated stacking.
- **[R2] `src/lib/engine/detectors.ts`** — `ribat` (رِباط الملتقى): lexical continuity held against isnād motion; `stitchWindow` bounds the seam.
- **[R2] `src/lib/engine/assembler.ts`** — assembles recitations by stitching mined findings.
- **[R3] `spec/07-segment.md`** — the chunk profile: a signature independent of the letters; alignment measurable without reading a word.
- **[R3] `lib/engine/text.ts`** — `expand`, `degree`, `profileOf`, `profile`: the executable substrate operations.
- **[R3] `lib/engine/collapse.ts`** — filters prune the candidate set; the audit ends by checking whether the true reading survived.

## [Collider]

| Interface pressure | al-Mirtāl (Repo 1) | Isnād Studio (Repo 2) | ARABIC_TIMELESS (Repo 3) | Cross-verification forced |
|---|---|---|---|---|
| Stitching primitive | `wasl` stitches, `hamal` carries across a stop, `ihata` encloses by repetition | `assembler.ts` stitches discoveries into recitations; رِباط stitches seams | `text.ts` expands and profiles skeletons; `compose.ts` composes operations | Forces a common stitch contract: what may be joined, and what evidence every join must carry. |
| Continuity metric | وَزْن: information in bits (`log2 N/n`) | `lexicalContinuity × isnādDelta`: the master metric | Profile survival under transforms; filter survival in collapse | Forces the Rigidity Coefficient to be computable in all three: bits, products, and profiles must agree on what "holds". |
| Margin discipline | Citations, role labels, and weights are apparatus — never in the line | Detectors report structure; interpretation belongs to the reader | Layer Contract: substrate independence; nothing any era might lack | Forces a shared mediation boundary: apparatus must be separable from substrate in every architecture, by construction. |
