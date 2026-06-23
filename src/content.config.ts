import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

/** Pattern entries — the heart of the library. One MDX file per technique. */
const patterns = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/patterns" }),
  schema: z.object({
    title: z.string(),
    code: z.string(), // e.g. "M1", "T2"
    category: z.string(), // human-readable group, e.g. "Monetary & randomised"
    family: z.string(), // family id, e.g. "monetary"
    severity: z.enum(["Low", "Medium", "High", "Severe"]),
    platforms: z.array(z.string()).default([]),
    evidenceLevel: z.enum(["Strong", "Moderate", "Emerging"]),
    evidenceNote: z.string().optional(),
    harmVectors: z.array(z.string()).default([]), // harm ids
    modes: z.array(z.string()).default([]), // mode ids
    tags: z.array(z.string()).default([]),
    summary: z.string(),
    examples: z.array(z.string()).default([]),
    references: z.array(z.string()).default([]), // reference ids
    related: z.array(z.string()).default([]), // optional manual pattern codes
    aliases: z.array(z.string()).default([]),
    screenshots: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string(),
          credit: z.string().optional(),
        }),
      )
      .default([]),
    updated: z.string().optional(),
  }),
});

/** Glossary — concept definitions in MDX. */
const glossary = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/glossary" }),
  schema: z.object({
    term: z.string(),
    aliases: z.array(z.string()).default([]),
    short: z.string(),
    seeAlso: z.array(z.string()).default([]),
    references: z.array(z.string()).default([]),
  }),
});

/** Mechanism families (Axis A). */
const families = defineCollection({
  loader: file("./src/content/families.json"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    kind: z.enum(["General", "Games-salient"]),
    description: z.string(),
  }),
});

/** Harm vectors (Axis B). */
const harms = defineCollection({
  loader: file("./src/content/harms.json"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
  }),
});

/** Five modes of adversarial design. */
const modes = defineCollection({
  loader: file("./src/content/modes.json"),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    wrong: z.string(),
    operatesOn: z.string(),
    needsIntent: z.string(),
    example: z.string(),
    references: z.array(z.string()).default([]),
  }),
});

/** Harm-conditionality rubric (8 dimensions). */
const rubric = defineCollection({
  loader: file("./src/content/rubric.json"),
  schema: z.object({
    id: z.string(),
    dimension: z.string(),
    greener: z.string(),
    darker: z.string(),
  }),
});

/** Bibliography — CSL-JSON, the source of truth for references. */
const references = defineCollection({
  loader: file("./src/content/references.csl.json"),
  schema: z
    .object({
      id: z.string(),
      type: z.string().default("article-journal"),
      title: z.string(),
      author: z
        .array(
          z.object({
            family: z.string().optional(),
            given: z.string().optional(),
            literal: z.string().optional(),
          }),
        )
        .default([]),
      issued: z
        .object({ "date-parts": z.array(z.array(z.number())) })
        .optional(),
      "container-title": z.string().optional(),
      publisher: z.string().optional(),
      DOI: z.string().optional(),
      URL: z.string().optional(),
      note: z.string().optional(),
      category: z.string().optional(), // paper | book | report | legal
    })
    .passthrough(),
});

export const collections = {
  patterns,
  glossary,
  families,
  harms,
  modes,
  rubric,
  references,
};
