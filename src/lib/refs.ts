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
  volume?: string | number;
  issue?: string | number;
  page?: string | number;
  note?: string;
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

/** First-name initials, e.g. "Gloria Xiaodan" -> "G. X." */
function initials(given?: string): string {
  return (given ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((g) => (g[0] ? g[0].toUpperCase() + "." : ""))
    .join(" ");
}

/** APA-style author list, e.g. "Zhang, G. X., & Seaborn, K." */
function apaAuthors(d: CSL): string {
  const names = (d.author ?? [])
    .map((a) =>
      a.literal ? a.literal : [a.family, initials(a.given)].filter(Boolean).join(", "),
    )
    .filter(Boolean);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join(", ") + ", & " + names[names.length - 1];
}

/** APA 7th-style reference string (plain text; the reader can italicise). */
export function formatAPA(d: CSL): string {
  const out: string[] = [];
  const a = apaAuthors(d);
  out.push(a ? `${a} (${refYear(d)}).` : `(${refYear(d)}).`);
  out.push(`${d.title}.`);
  const ct = d["container-title"];
  if (ct && d.type === "article-journal") {
    let vol = d.volume ? `${d.volume}` : "";
    if (d.issue) vol += `(${d.issue})`;
    let s = ct;
    if (vol) s += `, ${vol}`;
    if (d.page) s += `, ${d.page}`;
    out.push(`${s}.`);
  } else if (ct) {
    let s = `In ${ct}`;
    if (d.page) s += ` (pp. ${d.page})`;
    out.push(`${s}.`);
    if (d.publisher) out.push(`${d.publisher}.`);
  } else if (d.publisher) {
    out.push(`${d.publisher}.`);
  }
  if (d.DOI) out.push(`https://doi.org/${d.DOI}`);
  else if (d.URL) out.push(d.URL);
  return out.join(" ");
}

/** ACM (SIGCHI) author list, full names: "A B and C D" / "A, B, and C". */
function acmAuthors(d: CSL): string {
  const names = (d.author ?? [])
    .map((a) => (a.literal ? a.literal : [a.given, a.family].filter(Boolean).join(" ")))
    .filter(Boolean);
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
}

/** ACM Reference Format (SIGCHI) string. */
export function formatACM(d: CSL): string {
  const out: string[] = [];
  const a = acmAuthors(d);
  if (a) out.push(`${a}.`);
  out.push(`${refYear(d)}.`);
  out.push(`${d.title}.`);
  const ct = d["container-title"];
  if (ct && d.type === "article-journal") {
    let s = ct;
    if (d.volume) s += ` ${d.volume}`;
    if (d.issue) s += `, ${d.issue}`;
    s += ` (${refYear(d)})`;
    if (d.page) s += `, ${d.page}`;
    out.push(`${s}.`);
  } else if (ct) {
    let s = `In ${ct}`;
    if (d.page) s += `, ${d.page}`;
    out.push(`${s}.`);
    if (d.publisher) out.push(`${d.publisher}.`);
  } else if (d.publisher) {
    out.push(`${d.publisher}.`);
  }
  if (d.DOI) out.push(`https://doi.org/${d.DOI}`);
  else if (d.URL) out.push(d.URL);
  return out.join(" ");
}

export const CATEGORY_LABEL: Record<string, string> = {
  paper: "Papers",
  book: "Books & chapters",
  report: "Reports",
  legal: "Legal & regulatory",
};
