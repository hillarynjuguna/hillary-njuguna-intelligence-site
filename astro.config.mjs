import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://hillarynjuguna.com',
  output: 'server',
  adapter: vercel(),
  integrations: []
});
