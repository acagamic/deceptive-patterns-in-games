# Rubric severity × evidence scatterplot + references fold-in — design

Date: 2026-06-23

Two changes to the Deceptive Patterns site, both shipped together.

## Part A — severity × evidence scatterplot on `/rubric`

### Why
Severity and evidence are the two per-pattern scores, but the site never explains
the *evidence* scale at all, and never shows the catalogue mapped against the two
together. The data also tells a story worth surfacing: evidence concentrates on the
most severe patterns, the bulk sits at Medium/Moderate, and there is a lone
Severe×Emerging watch-list item (personalised spend-optimisation).

### Data shape (drives the whole design)
Two ordinal scales, not continuous: severity ∈ {Low, Medium, High, Severe} (4),
evidence ∈ {Emerging, Moderate, Strong} (3). ~49 patterns at design time (the
chart is data-driven and tracks the live catalogue — 56 at first build), heavily
tied — the bulk land on Medium×Moderate; several cells are empty. So overlap
handling is the crux.

Joint matrix (rows = severity, cols = evidence):
```
            Emerging  Moderate  Strong   TOTAL
Severe          1        ·         1        2
High            ·        5         6       11
Medium          7       26         ·       33
Low             1        2         ·        3
            ─────────────────────────────────
TOTAL           9       33         7       49
```

### Component — `src/components/ScatterViz.astro`
Mirrors `AxisViz.astro` conventions exactly: server-side pulls `allPatterns()`,
projects each to `{slug, code, title, severity, evidence, note}`, serialises to a
JSON `<script>` tag; client-side inline D3 (`import { select } from "d3"`) reads it
and draws. Same CSS-variable theming, `.scroll` wrapper + `min-width`, hover caption,
click-through, keyboard support.

- **Encoding**: Y = severity (Low→Severe, upward), X = evidence (Emerging→Strong,
  rightward). Colour = severity via existing `--sev-*` tokens (row position + colour
  both encode severity → accessible redundancy).
- **Overlap**: packed dots — one dot per pattern, deterministic `√n` grid packing
  centred in each cell, sorted by title for stable order. No jitter.
- **Priority corner**: faint `--sev-high` tint behind the High/Severe × Strong cells
  with a small "priority corner" label. Empty cells left as meaningful whitespace.
- **Interactions**: hover/focus enlarges the dot and writes `code · title — severity ·
  evidence` + the pattern's `evidenceNote` into the caption; click / Enter →
  `/patterns/{slug}`; `role="link"`, per-dot `aria-label`, `tabindex=0`; `svg
  role="img"` with summary `aria-label`.

### Placement & content on `/rubric`
New section "The two scores: severity & evidence" inserted after the "whose purpose
does it serve?" block and before the spectrum. Contains:
1. A lede stating the two scores are **independent axes** (severe-but-unstudied vs
   well-evidenced-but-modest) — the reason they are plotted orthogonally.
2. Two definition lists rendered with the existing `Badge` component (tones `sev-*`
   and `ev-*`), defined as two inline arrays `severityScale` / `evidenceScale` in the
   page frontmatter (matching how `tiers` / `spectrum` / `brightLines` are already
   done — no schema change). Severity hands off to the existing spectrum + tiers
   below; evidence is wholly new.
3. `<ScatterViz />`.

No schema or `content.py` change. `d3` is already a dependency.

## Part B — fold foundational/practitioner works into `/references`

### Remove
The intro caveat on `src/pages/references/index.astro` claiming "DOI-linked …
foundational works … credited on the About page." It is now self-contradictory
(the works are being added here) and its "sole non-DOI exception" framing was
already inaccurate (several `webpage` refs carry no DOI). Replace with a short,
accurate one-liner that keeps the dynamic `{refs.length}` count and adds "books".

### Add (4 entries to `references.csl.json`)
All verified before citing (web-confirmed titles/authors/years):
- `zagal-2013` — Zagal, Björk & Lewis, "Dark patterns in the design of games",
  FDG 2013. `paper-conference`, category `paper`, no DOI (foundational; predates
  DOIs), URL = author-hosted proceedings PDF.
- `brignull-deceptivedesign` — Harry Brignull, "Deceptive Design (formerly Dark
  Patterns)", the practitioner catalogue. `webpage`, category `report`.
- `brignull-2023` — Harry Brignull, "Deceptive Patterns: Exposing the Tricks Tech
  Companies Use to Control You", Testimonium, 2023. `book`, category `book`.
- `leiser-2025` — Mark Leiser, "Dark Patterns, Deceptive Design, and the Law: AI's
  Hidden Influence on Our Digital Experience", Bloomsbury, 2025. `book`, category
  `book`.

The references page already lists every collection entry and sorts by category then
author, so the new entries appear under Papers / Books & chapters / Reports with no
further wiring. About-page credits stay (narrative lineage, not a duplicate).

## Verify
`npm run build` clean, then preview + screenshot `/rubric` and `/references`; commit
and push (Netlify auto-deploys); confirm live.

## Out of scope
Per-pattern `MetaTable` changes, on-chart filtering, the disabled "Serves gameplay ·
0" filter chip, and linking the new bibliography entries from individual patterns.
