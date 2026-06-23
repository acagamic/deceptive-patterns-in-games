// Builds src/data/community.json: a crosswalk from our pattern slugs to the
// community DarkPattern.games catalogue (title, URL, example-game count, and a
// few example game titles for orientation — no quotes republished).
//
// Source data: ../darkpattern_games_overview.json (a sitemap crawl of
// darkpattern.games, kept OUTSIDE the repo). Run from the project root:
//   node scripts/build-community.mjs
// The generated community.json IS committed; this script only needs the source
// file present when regenerating.
import fs from "node:fs";
import path from "node:path";

const SRC = path.resolve(process.cwd(), "..", "darkpattern_games_overview.json");
const OUT = path.resolve(process.cwd(), "src", "data", "community.json");

// our pattern slug -> darkpattern.games pattern slug
const MAP = {
  "loot-boxes-gacha": "gambling-loot-boxes",
  "premium-currency-obfuscation": "premium-currency",
  "bundle-anchoring-decoys": "anchoring-tricks",
  "pay-to-win": "pay-to-win",
  "pay-to-skip-engineered-grind": "pay-to-skip",
  "fomo-limited-time-offers": "artificial-scarcity",
  "monetising-quality-of-life": "pay-wall",
  "predatory-forced-advertising": "advertisements",
  "accidental-purchase-ui": "accidental-purchases-",
  "subscription-battle-pass-traps": "recurring-fee",
  "grinding-engineered-repetition": "grinding",
  "energy-wait-timers": "wait-to-play",
  "daily-login-streaks": "daily-rewards",
  "sticky-loops": "infinite-treadmill",
  "social-obligation-guilt": "social-obligation-guilds",
  "gifting-invitation-spam": "social-pyramid-scheme",
  "impersonation-system-as-friend": "friend-spam-impersonation",
  "variable-ratio-near-miss": "variable-rewards",
  "sunk-cost-entrapment": "invested-endowed-value",
  "illusion-of-control": "illusion-of-control",
  "aesthetic-sensory-manipulation": "aesthetic-manipulations",
  "power-creep": "power-creep",
  "cant-pause-or-save": "can-t-pause-or-save",
  "collection-completionism": "complete-the-collection",
  "endowed-progress": "badges-endowed-progress",
  "optimism-frequency-bias": "optimism-and-frequency-biases",
  "reciprocity": "reciprocity",
  "encourages-anti-social-behaviour": "encourages-anti-social-behavior",
  "manufactured-competition": "competition",
};

if (!fs.existsSync(SRC)) {
  console.error(`Source not found: ${SRC}\nSkipping; existing community.json (if any) is kept.`);
  process.exit(0);
}

const data = JSON.parse(fs.readFileSync(SRC, "utf8"));
const bySlug = new Map((data.patterns || []).map((p) => [p.slug, p]));

const out = {};
for (const [ours, dpg] of Object.entries(MAP)) {
  const p = bySlug.get(dpg);
  if (!p) {
    console.warn(`No dpg pattern for slug '${dpg}' (mapped from '${ours}')`);
    continue;
  }
  const games = (p.example_games || [])
    .map((g) => g.game_title || g.name || g.title)
    .filter(Boolean);
  out[ours] = {
    title: p.title,
    url: p.url,
    category: p.category?.title || null,
    exampleCount: p.example_game_count_on_page ?? games.length,
    examples: games.slice(0, 4),
  };
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`Wrote ${Object.keys(out).length} community crosswalk entries -> ${path.relative(process.cwd(), OUT)}`);
