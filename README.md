# Oscillatory Fields

> Intelligence architecture for institutions that can't afford to get it wrong.

**Hillary Njuguna · hillary-site.vercel.app**

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Astro 5 (server output, Vercel adapter) |
| Content | Markdown + MDX via Astro Content Collections |
| AI Layer | OpenRouter API (Mistral), provider-agnostic abstraction |
| Forms | Formspree (`maqdrora` endpoint) |
| Hosting | Vercel (auto-deploy on git push) |
| Sitemap | @astrojs/sitemap (auto-generated) |
| RSS | @astrojs/rss (Digest feed) |

---

## Running locally

```bash
# 1. Install dependencies
npm install

# 2. Set environment variable
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# 3. Start dev server
npm run dev
# → http://localhost:4321

# 4. Build for production
npm run build
```

---

## Adding content

**Everything that matters lives in `src/content/`.** No HTML editing required.

### Add a new Digest entry

Create a file at `src/content/digest/your-entry-slug.md`:

```markdown
---
title: "Your Entry Title"
summary: "One sentence summary for SEO and card display."
publishedAt: 2026-03-15
tags: ["tag1", "tag2"]
category: "Field Notes"
featured: false
draft: false
---

Your content here in markdown.
```

Push → Vercel auto-deploys → entry appears at `/digest/your-entry-slug`.

### Add a new Research entry

Create `src/content/research/your-slug.md` with the same pattern. Required frontmatter fields: `title`, `summary`, `publishedAt`. Optional: `tags`, `themes`, `concepts`, `featured`, `related`.

### Add a new Product page

Create `src/content/products/your-slug.md`. Required: `title`, `summary`, `productType`, `status`. Status options: `live`, `development`, `waitlist`, `coming-soon`.

### Add a Clause candidate

Create `src/content/clauses/your-slug.md`. Required: `title`, `clauseText`, `generatedAt`, `status`.

### Update the current signal / hero status

Edit `src/content/signals/current-state.json` — no code change, just update the JSON.

---

## Route structure

| Route | Purpose |
|-------|---------|
| `/` | Landing — hero, signal, featured content |
| `/research` | Research index |
| `/research/[slug]` | Individual research entries |
| `/products` | Product index |
| `/products/[slug]` | Individual product pages |
| `/digest` | Intelligence Digest feed |
| `/digest/[slug]` | Individual digest entries |
| `/orchestra` | The 7-model methodology |
| `/corpus` | AI corpus interaction |
| `/clauses` | Governance clause archive |
| `/contact` | Contact form |
| `/rss.xml` | RSS feed (Digest) |
| `/sitemap-index.xml` | Sitemap |
| `/search.json` | Machine-readable content index |

---

## Deployment

### Environment variables (set in Vercel dashboard)

| Variable | Purpose | Required |
|----------|---------|----------|
| `OPENROUTER_API_KEY` | AI chat and synthesis | Yes |
| `FORMSPREE_ENDPOINT` | Contact form (reference only — hardcoded) | No |

### Deploy flow

1. Set `OPENROUTER_API_KEY` in Vercel → Settings → Environment Variables
2. Push to any connected branch → Vercel builds and deploys automatically
3. Build command: `npm run build`
4. Output directory: `dist`

---

## AI provider hooks

**Location:** `src/pages/api/chat.ts` and `src/pages/api/synthesize.ts`

The AI integration uses a provider-agnostic pattern. To swap providers:

1. Update `PROVIDER_URL` (the endpoint)
2. Update `MODEL` (the model slug)
3. Update `SYSTEM_PROMPT` if the new model needs different framing
4. The request/response format follows OpenAI-compatible chat completion spec

Both endpoints are Astro server routes — they execute server-side, keeping the API key safe.

---

## SEO metadata

Generated in `src/components/seo/SEOHead.astro` and `src/lib/seo.ts`.

- Every page gets unique title, description, OG tags, canonical URL
- Structured data (JSON-LD): WebSite, Person, Article, Product, BreadcrumbList schemas
- RSS at `/rss.xml` for the Digest
- Sitemap auto-generated at `/sitemap-index.xml`
- Machine-readable content index at `/search.json`

To update site-wide defaults: edit `src/data/site.ts`.

---

## Comments hooks

Comments are architected for future integration — not yet active.

When ready to add:
1. Choose: Giscus (simplest), Supabase-backed custom, or serverless custom
2. Create `src/components/comments/Comments.astro` with the integration
3. Add to `ContentLayout.astro` and `DigestLayout.astro`
4. The AI synthesis endpoint can optionally respond to comments if extended

---

## File structure

```
src/
  content/
    config.ts          ← Zod schemas for all collections
    digest/            ← Markdown digest entries
    research/          ← Markdown research entries
    products/          ← Markdown product pages
    clauses/           ← Markdown governance clauses
    signals/           ← JSON current signal / status
  data/
    site.ts            ← Site-wide config and metadata
    navigation.ts      ← Nav links, orchestra models, services, ticker items
  layouts/
    BaseLayout.astro   ← Root layout (HTML head, nav, footer)
    ContentLayout.astro ← For research and digest entries
    ProductLayout.astro ← For product pages with sidebar CTA
  components/
    seo/SEOHead.astro  ← All meta, OG, JSON-LD
    layout/Nav.astro   ← Navigation
    layout/Footer.astro ← Footer
    ui/Breadcrumbs.astro ← Breadcrumb navigation
    content/RelatedContent.astro ← Related content block
  lib/
    content.ts         ← Content collection helpers
    seo.ts             ← SEO and schema builders
  pages/
    index.astro        ← Landing
    research/          ← Research routes
    digest/            ← Digest routes
    products/          ← Product routes
    orchestra.astro    ← Methodology
    corpus.astro       ← AI corpus interface
    clauses/           ← Governance archive
    contact.astro      ← Contact form
    api/chat.ts        ← AI chat endpoint
    api/synthesize.ts  ← Synthesis endpoint
    rss.xml.ts         ← RSS feed
    search.json.ts     ← Content index
  styles/
    global.css         ← Global styles (imports tokens, prose, motion)
    tokens.css         ← Design tokens (colors, type, spacing)
    prose.css          ← Long-form reading styles
    motion.css         ← Animation, ticker, scroll reveal
```

---

*Built from a hostel in Nairobi with a Chromebook and an internet connection.*
*560+ sourced documents. 18 months. 7 models. Oscillatory Fields — February 2026.*
