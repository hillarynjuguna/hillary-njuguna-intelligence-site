# Oscillatory Fields

**Intelligence architecture for institutions that can't afford to get it wrong.**

I help technical leaders deploy AI systems that won't fail catastrophically. Using proprietary governance architecture, I identify structural risks before they cascade—so you ship with confidence, not cleanup.

## What You'll Find Here

This is the public research portal for the Oscillatory Fields corpus—a suite of frameworks, tools, and training for AI governance and constitutional design.

### For Enterprise Leaders
- **[Bainbridge Warning](https://github.com/hillarynjuguna/bainbridge-warning)** — Governance failure diagnostics for AI deployments
- **[Audit Template](https://github.com/hillarynjuguna/bainbridge-warning/blob/main/AUDIT_TEMPLATE.md)** — Downloadable governance assessment tool
- **[CIR Assessment](https://github.com/hillarynjuguna/ai-governance-coherence-architecture)** — Readiness evaluation for production AI

### For Researchers
- **[DCFB](https://github.com/hillarynjuguna/dcfb)** — Distributed Cognition Fear Bypass theoretical framework
- **[RSPS Architecture](https://github.com/hillarynjuguna/rsps-architecture)** — Multi-model cognitive orchestration

### For Practitioners
- **[Martha Cohorts](https://github.com/hillarynjuguna/martha-course)** — 12-module training program
- **[Live Site](https://hillarynjuguna.vercel.app)** — Interactive research portal

## Quick Start

1. **New here?** Start with the [Bainbridge Warning](https://github.com/hillarynjuguna/bainbridge-warning)
2. **Want to assess your system?** Download the [Audit Template](https://github.com/hillarynjuguna/bainbridge-warning/blob/main/AUDIT_TEMPLATE.md)
3. **Ready to deploy?** Explore [RSPS](https://github.com/hillarynjuguna/rsps-architecture) for implementation

---

## Technical Stack

- **Site Generator:** Astro 5
- **Deployment:** Vercel (Edge + Serverless)
- **AI Integration:** OpenRouter API (multi-provider fallback)
- **Content:** Markdown + Content Collections

[View full technical documentation](./docs/TECHNICAL.md)
## Everything that matters lives in `src/content/`. 

No HTML editing required. The site is a **Sovereign Cognitive Node** powered by a multi-model reasoning substrate.

### Core Collections

*   **Research (`/research`)**: The theoretical corpus. Includes the **Lexicon** series (e.g., #4 Activation Intelligence & Calibration) and foundational frameworks like **DCFB** and **Martha**.
*   **Products (`/products`)**: Practical deployments of the research. Currently featuring the **GTM Engine** (Activation Intelligence for F&B).
*   **Digest (`/digest`)**: Real-time field reports and sitreps. See **Field Dispatch #01: Sovereign Calibration**.
*   **Clauses (`/clauses`)**: The governance layer. Formal rules for agentic behavior and substrate-agnostic execution.
*   **Signals (`/signals`)**: High-level status and current cognitive focus.

---

## Route structure

| Route | Purpose |
|-------|---------|
| `/` | Landing — Sovereign Signal and Calibration Status |
| `/research` | The Lexicon and Theoretical Frameworks |
| `/products` | Activation Intelligence Engine Deployments |
| `/digest` | Field Dispatches and Practitioner Briefs |
| `/orchestra` | The 7-model Recursive Reasoning methodology |
| `/corpus` | Sovereign Memory Layer interaction |
| `/clauses` | Governance and Constitutional Archive |

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

*Built from a local-first sovereign node in Kuala Lumpur.*
*600+ sourced documents. Recursive calibration. 7 models. Hillary Njuguna — March 2026.*
