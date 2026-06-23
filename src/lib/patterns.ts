import { getCollection, type CollectionEntry } from "astro:content";

export type Pattern = CollectionEntry<"patterns">;

const SEV: Record<string, number> = { Low: 1, Medium: 2, High: 3, Severe: 4 };
export function sevRank(s: string): number {
  return SEV[s] ?? 0;
}

export function sevTone(s: string): string {
  return (
    {
      Low: "sev-low",
      Medium: "sev-medium",
      High: "sev-high",
      Severe: "sev-severe",
    }[s] ?? "neutral"
  );
}

export function evTone(e: string): string {
  return (
    {
      Strong: "ev-strong",
      Moderate: "ev-moderate",
      Emerging: "ev-emerging",
    }[e] ?? "neutral"
  );
}

export async function allPatterns(): Promise<Pattern[]> {
  const p = await getCollection("patterns");
  return p.sort((a, b) => a.data.title.localeCompare(b.data.title));
}

/** Related patterns by shared tags (weighted), family, and harm vectors. */
export function relatedPatterns(
  target: Pattern,
  all: Pattern[],
  limit = 6,
): Pattern[] {
  const score = (p: Pattern) => {
    if (p.id === target.id) return -1;
    const tag = p.data.tags.filter((t) => target.data.tags.includes(t)).length;
    const fam = p.data.family === target.data.family ? 1 : 0;
    const harm = p.data.harmVectors.filter((h) =>
      target.data.harmVectors.includes(h),
    ).length;
    return tag * 2 + fam + harm;
  };
  return all
    .map((p) => ({ p, s: score(p) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.p.data.title.localeCompare(b.p.data.title))
    .slice(0, limit)
    .map((x) => x.p);
}

export function tagCounts(all: Pattern[]): { tag: string; count: number }[] {
  const m = new Map<string, number>();
  for (const p of all)
    for (const t of p.data.tags) m.set(t, (m.get(t) ?? 0) + 1);
  return [...m.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** id -> title maps for families, harms, and modes. */
export async function labelMaps() {
  const [fam, harm, mode] = await Promise.all([
    getCollection("families"),
    getCollection("harms"),
    getCollection("modes"),
  ]);
  return {
    family: new Map(fam.map((f) => [f.id, f.data.title])),
    harm: new Map(harm.map((h) => [h.id, h.data.title])),
    mode: new Map(mode.map((m) => [m.id, m.data.title])),
  };
}

export function tagLabel(t: string): string {
  return t.replace(/-/g, " ");
}
