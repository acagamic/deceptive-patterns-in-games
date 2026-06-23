# Exploitative Patterns in Games

A research primer and reference library for **exploitative, deceptive, and harmful design in games** — what the patterns are, how they work, and the conditions under which they become harmful. Built as a clear, source-anchored orientation for students, journalists, developers, parents, and policymakers.

Prepared around the **2026 Dagstuhl Seminar on Harms**.

## Why it exists

- **Exploitation over deception.** While "deceptive design" (or "deceptive patterns") is the common regulatory term for dark patterns, deception strictly requires inducing or exploiting a *false belief* about a material fact (e.g., hiding odds). In contrast, many of the gravest harms in games (such as loot boxes, aggressive monetization, or whale-targeting) are fully transparent, yet take *unfair advantage of a vulnerability* (such as cognitive biases, age, or impulsivity). This is the definition of exploitation. By focusing on **Exploitative Patterns**, this primer addresses design choices that harm players regardless of whether they are deceived.
- **Deception ≠ harm.** Games legitimately deceive (bluffs, fog of war, plot twists). Entries are classified by the *conditions* under which they become harmful — see the [harm rubric](src/pages/rubric.astro) — not by the label.
- **Evidence on the surface.** Every pattern carries an evidence level and resolvable sources, with DOI-linked scholarship where available and primary web sources where they document the mechanism — more transparent than a votes-only directory.

## Stack

| Layer | Tool |
|---|---|
| Content engine | [Astro](https://astro.build) 7 content collections |
| Writing layer | MDX (one file per pattern / glossary term) |
| Design system | Tailwind CSS v4 (CSS-first tokens, light + dark) |
| Search | [Pagefind](https://pagefind.app) (static, built post-`astro build`) |
| References | CSL JSON in-repo (`src/content/references.csl.json`) |
| Deploy | Netlify (static) |

## Quick start

```bash
npm install
npm run dev        # local dev at http://localhost:4321  (search is build-only)
npm run build      # astro build + pagefind index → dist/
npm run preview    # serve the production build (search works here)
npm run generate   # regenerate pattern/glossary MDX from scripts/seed/*.json
```

## Project structure

```
src/
  content/
    patterns/*.mdx        technique entries generated from scripts/seed/patterns.json
    glossary/*.mdx        concept definitions
    families.json         Axis A — mechanism families
    harms.json            Axis B — harm vectors
    modes.json            five modes of adversarial design
    rubric.json           eight harm-conditionality dimensions
    references.csl.json    bibliography (source of truth, DOI/URL sources)
  content.config.ts       collection schemas (zod)
  components/             Badge, PatternCard, MetaTable, Citation, Header, Footer
  layouts/Base.astro
  lib/                    patterns.ts, refs.ts (helpers)
  pages/                  routes (see below)
  styles/global.css       Tailwind tokens + prose styles
scripts/
  seed/*.json             structured seed data
  generate.mjs            seed → MDX generator
```

## Routes

`/` · `/patterns` (faceted) · `/patterns/[slug]` · `/families[/id]` · `/harms[/id]` · `/tags[/tag]` · `/glossary[/slug]` · `/references[/id]` · `/rubric` · `/a-z` · `/about` · `/search`.

Related-pattern links are generated at build from shared tags, family, and harm vectors.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add a pattern, a reference, or a glossary term. In short: patterns are MDX files with structured frontmatter; references are CSL-JSON objects keyed by a stable `id` (e.g. `gray-2018`) that entries cite. A shared Zotero library can export straight into CSL JSON.

## Deployment

Netlify builds from the repo on every push: `npm run build` produces `dist/` (including the Pagefind index), which Netlify publishes. Config lives in [`netlify.toml`](netlify.toml). Update `site` in [`astro.config.mjs`](astro.config.mjs) and the `Sitemap:` line in `public/robots.txt` when the production domain is set.

## License

Site **code** is [MIT](LICENSE). Written **content** is [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Cited works remain under their publishers' rights. This is an educational resource, **not legal advice**; naming a pattern is not an accusation against any specific title.
