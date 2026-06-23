// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Update `site` to the production URL at deploy time (Netlify / custom domain).
export default defineConfig({
  site: process.env.SITE_URL || "https://deceptivepatterns.lennartnacke.com",
  integrations: [mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
