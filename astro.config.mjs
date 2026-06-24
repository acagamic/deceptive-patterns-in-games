// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";

// Update `site` to the production URL at deploy time (Netlify / custom domain).
export default defineConfig({
  site: process.env.SITE_URL || "https://exploitativepatterns.lennartnacke.com",
  integrations: [icon(), mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
