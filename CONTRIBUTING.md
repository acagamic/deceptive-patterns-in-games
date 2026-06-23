# Contributing

Thanks for helping build an accurate, well-sourced reference. The library is designed so several people can add entries and references without stepping on each other.

## Run it locally

```bash
npm install
npm run dev       # http://localhost:4321
npm run build && npm run preview   # to test search + the production build
```

## Add or edit a pattern

Patterns live as one MDX file each in `src/content/patterns/`. Create `your-slug.mdx`:

```mdx
---
title: "Daily rewards"
code: "T3"                       # short axis code, unique
category: "Temporal & attention" # display group
family: "temporal"               # id from families.json
severity: "Medium"               # Low | Medium | High | Severe
platforms: ["Mobile / F2P"]
evidenceLevel: "Moderate"        # Strong | Moderate | Emerging
evidenceNote: "Loss-aversion mechanic; documented across temporal-pattern studies."
harmVectors: ["time-attention", "emotional"]  # ids from harms.json
modes: ["manipulative", "coercive"]           # ids from modes.json
tags: ["streaks", "habit-formation", "retention"]
aliases: ["login bonuses", "streak rewards"]
summary: "One-sentence operational definition."
examples: ["A 30-day reward calendar that resets on a single miss"]
references: ["lewis-2014", "radesky-2022"]     # ids from references.csl.json
related: []                       # optional; most relations are auto-generated
updated: "2026-06-23"
---

## How it works

Two or three sentences on the mechanism.

## Why it can be harmful

Two or three sentences tying it to the harm vectors and the rubric.
```

The body is rendered below an auto-generated metadata table and an "Examples" / "References" block built from the frontmatter, so keep the body to the two sections above. Avoid raw `<` or `{` in prose (MDX treats them specially).

> The initial 33 entries were generated from `scripts/seed/patterns.json` via `npm run generate`. You can either edit the MDX directly (preferred for one-off changes) or edit the seed and regenerate. Don't do both for the same entry.

## Add a reference

References are the source of truth in `src/content/references.csl.json` (a CSL-JSON array). Add an object and cite its `id` from any pattern or glossary entry.

**ID convention:** `firstauthorlastname-year`, lowercased and ASCII (e.g. `gray-2018`, `king-delfabbro-2019`). For collisions in the same author-year, append `a`/`b` (e.g. `king-delfabbro-2018a`). **Every reference must have a resolvable DOI** — this is a DOI-only library.

```json
{
  "id": "newall-2025",
  "type": "article-journal",
  "category": "paper",            // paper | book | report | legal
  "title": "…",
  "author": [{ "family": "Newall", "given": "P. W. S." }],
  "issued": { "date-parts": [[2025]] },
  "container-title": "Addiction",
  "DOI": "10.1111/add.70085",
  "URL": "https://doi.org/10.1111/add.70085"
}
```

A shared **Zotero** library can be the upstream source of truth: export the collection as CSL JSON and replace `references.csl.json`, keeping the `id` values stable so existing citations keep resolving.

## Other content

- **Glossary** terms: MDX in `src/content/glossary/` (`term`, `aliases`, `short`, `seeAlso`, `references` + a prose body).
- **Families, harms, modes, rubric**: small JSON files in `src/content/`. Membership pages (which patterns belong to a family/harm) are derived automatically from pattern frontmatter — you don't list members by hand.

## Before opening a PR

```bash
npm run build     # must pass; it validates every frontmatter field against the schema
```

Check that new references resolve at `https://doi.org/<DOI>` and that severity/evidence labels are defensible against the cited sources. Keep examples illustrative of genres/mechanics — not accusations about specific titles.
