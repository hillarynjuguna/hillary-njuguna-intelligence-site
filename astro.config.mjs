import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://hillary-site.vercel.app',
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap(), react()]
});
