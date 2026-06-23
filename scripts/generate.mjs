// Generates MDX entries from the structured seeds in scripts/seed/.
// Re-runnable: it overwrites the generated MDX. After the initial seed,
// contributors can edit the MDX files directly (see CONTRIBUTING.md).
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readSeed = (f) =>
  JSON.parse(fs.readFileSync(path.join(root, "scripts", "seed", f), "utf8"));

// YAML-safe double-quoted scalar (a JSON string is a valid YAML double-quoted scalar).
const q = (s) => JSON.stringify(s ?? "");
const arr = (a = []) => "[" + a.map(q).join(", ") + "]";

function writeFile(dir, name, contents) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), contents);
}

// ---- Patterns ----
const patterns = readSeed("patterns.json");
const patternsDir = path.join(root, "src", "content", "patterns");
// clear previously generated files (keep dir)
for (const f of fs.existsSync(patternsDir) ? fs.readdirSync(patternsDir) : [])
  if (f.endsWith(".mdx")) fs.rmSync(path.join(patternsDir, f));

for (const p of patterns) {
  const fm = [
    "---",
    `title: ${q(p.title)}`,
    `code: ${q(p.code)}`,
    `category: ${q(p.category)}`,
    `family: ${q(p.family)}`,
    `severity: ${q(p.severity)}`,
    `purpose: ${q(p.purpose || "both")}`,
    `platforms: ${arr(p.platforms)}`,
    `evidenceLevel: ${q(p.evidenceLevel)}`,
    `evidenceNote: ${q(p.evidenceNote)}`,
    `harmVectors: ${arr(p.harmVectors)}`,
    `modes: ${arr(p.modes)}`,
    `tags: ${arr(p.tags)}`,
    `aliases: ${arr(p.aliases)}`,
    `summary: ${q(p.summary)}`,
    `examples: ${arr(p.examples)}`,
    `references: ${arr(p.references)}`,
    `related: ${arr(p.related || [])}`,
    `updated: "2026-06-23"`,
    "---",
    "",
    "## How it works",
    "",
    p.howItWorks,
    "",
    "## Why it can be harmful",
    "",
    p.whyHarmful,
    "",
  ].join("\n");
  writeFile(patternsDir, `${p.slug}.mdx`, fm);
}

// ---- Glossary ----
const glossary = readSeed("glossary.json");
const glossaryDir = path.join(root, "src", "content", "glossary");
for (const f of fs.existsSync(glossaryDir) ? fs.readdirSync(glossaryDir) : [])
  if (f.endsWith(".mdx")) fs.rmSync(path.join(glossaryDir, f));

for (const g of glossary) {
  const fm = [
    "---",
    `term: ${q(g.term)}`,
    `aliases: ${arr(g.aliases)}`,
    `short: ${q(g.short)}`,
    `seeAlso: ${arr(g.seeAlso)}`,
    `references: ${arr(g.references)}`,
    "---",
    "",
    g.body,
    "",
  ].join("\n");
  writeFile(glossaryDir, `${g.slug}.mdx`, fm);
}

console.log(
  `Generated ${patterns.length} patterns and ${glossary.length} glossary entries.`,
);
