import { getCollection } from "astro:content";

export type CSL = {
  id: string;
  type: string;
  title: string;
  author?: { family?: string; given?: string; literal?: string }[];
  issued?: { "date-parts": number[][] };
  "container-title"?: string;
  publisher?: string;
  DOI?: string;
  URL?: string;
  category?: string;
};

let cache: Map<string, CSL> | null = null;

export async function refMap(): Promise<Map<string, CSL>> {
  if (cache) return cache;
  const refs = await getCollection("references");
  cache = new Map(refs.map((r) => [r.id, r.data as unknown as CSL]));
  return cache;
}

export function refYear(d: CSL): string {
  return d.issued?.["date-parts"]?.[0]?.[0]?.toString() ?? "n.d.";
}

function oneAuthor(a: { family?: string; given?: string; literal?: string }): string {
  if (a.literal) return a.literal;
  return [a.family, a.given].filter(Boolean).join(", ");
}

export function refAuthors(d: CSL): string {
  const names = (d.author ?? []).map(oneAuthor).filter(Boolean);
  if (names.length === 0) return "";
  if (names.length <= 4) return names.join("; ");
  return names.slice(0, 4).join("; ") + ", et al.";
}

/** Short inline form, e.g. "Gray et al. (2018)". */
export function refShort(d: CSL): string {
  const first = d.author?.[0];
  const fam = first?.family ?? first?.literal ?? "Anon.";
  const etal = (d.author?.length ?? 0) > 1 ? " et al." : "";
  return `${fam}${etal} (${refYear(d)})`;
}

/** Full reference line (plain text; the page adds the DOI link separately). */
export function formatRef(d: CSL): string {
  const parts: string[] = [];
  const a = refAuthors(d);
  if (a) parts.push(`${a}`);
  parts.push(`(${refYear(d)}).`);
  parts.push(`${d.title}.`);
  if (d["container-title"]) parts.push(`${d["container-title"]}.`);
  if (d.publisher) parts.push(`${d.publisher}.`);
  return parts.join(" ");
}

export const CATEGORY_LABEL: Record<string, string> = {
  paper: "Papers",
  book: "Books & chapters",
  report: "Reports",
  legal: "Legal & regulatory",
};
