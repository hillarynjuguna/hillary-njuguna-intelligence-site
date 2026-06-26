# Architecture Reference — hillary-njuguna-intelligence-site

## Content Collections
All structured site content resides under:
- `src/content/research/` — Theoretical framework entries (.mdx)
- `src/content/digest/` — Field notes and synthesis dispatches (.mdx)
- `src/content/products/` — Product and service entries (.mdx)
- `src/content/clauses/` — Governance clause candidates (.mdx)
- `src/content/signals/` — Field signal analyses (.mdx)

Schemas are defined in `src/content/config.ts` and `src/lib/content/schemas/*.ts`.

## Build Graph Generation
The content graph (content-graph.json, relation-index.json, taxonomy-index.json, governance-index.json) is generated from frontmatter fields in content files. Key fields are:
- `lineage`, `domains`, `governanceRelevance`, `explicitRelations`, `crystallization`, `researchType`, `keyClaims`, `unresolvedEdges`

Files generated in `src/data/generated/` are build artifacts. Do not track them in git if excluded by `.gitignore`.

## Dynamic Edge API Routes
All server API routes (such as `/api/chat`) must use the dual environment variable pattern:
```typescript
process.env.KEY ?? import.meta.env.KEY
```
This is required to maintain compatibility across local dev environment (import.meta.env) and Vercel serverless edge runtime (process.env).

## SSR & Prerender Policy
The site runs in SSR mode (`output: 'server'`).
All static-capable routes (pages, RSS feeds, JSON endpoints) MUST declare:
```typescript
export const prerender = true;
```
This avoids node edge runtime Rollup bundling issues. Only edge API routes should omit this flag.
