import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { fileURLToPath } from 'url';
import path from 'path';

import { rehypeGlossary } from './src/lib/plugins/rehype-glossary.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  site: 'https://hillary-site.vercel.app',
  output: 'server',
  adapter: vercel(),
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/api/'),
    }),
  ],
  markdown: {
    rehypePlugins: [rehypeGlossary],
    shikiConfig: {
      theme: 'css-variables',
    },
  },
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@layouts': path.resolve(__dirname, 'src/layouts'),
        '@lib': path.resolve(__dirname, 'src/lib'),
        '@data': path.resolve(__dirname, 'src/data'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@content': path.resolve(__dirname, 'src/content'),
      },
    },
  },
});
