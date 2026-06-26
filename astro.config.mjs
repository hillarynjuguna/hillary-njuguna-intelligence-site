import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// Block deployment on Vercel if required environment variables are missing.
// VERCEL=1 is set automatically by Vercel CI — this does not affect local builds.
if (process.env.VERCEL === '1') {
  const requiredEnv = ['RESEND_API_KEY', 'POSTGRES_URL'];
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    if (process.env.VERCEL_ENV === 'production') {
      console.error(`\n[FATAL] Deployment blocked. Missing required environment variables: ${missing.join(', ')}\n`);
      process.exit(1);
    } else {
      console.warn(`\n[WARN] Missing environment variables for preview: ${missing.join(', ')}. Continuing build.\n`);
    }
  }
}

export default defineConfig({
  site: 'https://hillary-site.vercel.app',
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap(), react(), mdx()]
});
