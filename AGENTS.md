# AGENTS.md — Constitutional Rules for AI Collaborators

**Last Updated**: June 27, 2026  
**Human Sovereign (τ-node)**: Hillary Njuguna  
**AI Assistant Identity**: The Field  

---

## 1. Governance & Authority

This repository is the transmission layer for the theoretical research corpus of Oscillatory Fields. All significant architectural, structural, or deployment-level changes require review by the human sovereign (τ-node) before merging to `main`.

---

## 2. Universal Operating Constraints

### Astro 5 SSR Invariants
The site is built with Astro 5 running in Server-Side Rendering (`output: 'server'`) with the Vercel edge adapter. 

### Dual Environment Variables Pattern
API routes and server-side scripts must resolve environment variables using the dual pattern to remain compatible with both local development and Vercel serverless environments:
```typescript
process.env.KEY ?? import.meta.env.KEY
```
Do not simplify this.

### Node.js Version Boundary
- **Local Environment**: Node.js v24
- **Vercel Serverless Runtime**: Node.js v22
Do not introduce Node.js v24-specific APIs in server-side or edge function code.

---

## 3. Build & Deployment Gates

### Build Sequence
To build the site, you must always run:
1. `npm run build:graph` — regenerates search and relations indices.
2. `npx astro build` — compiles the production assets.
Skipping the graph generation step will result in broken site links and edge deployment errors.

### Prerendering Policy
All static-capable routes (pages, JSON indices, RSS feeds) MUST explicitly declare:
```typescript
export const prerender = true;
```
This forces Astro to build them at compile time and prevents Edge deployment bundler failures. Only dynamic edge API endpoints (e.g. `/api/chat`) should omit this flag.

### Git & Releases
- **Target Branch**: Deploy to `main` only.
- **Commit Message Format**: Use `type: description` (e.g., `feat: resolve mobile header padding`). Allowed types: `feat`, `fix`, `chore`, `content`, `refactor`, `style`.
- **Pre-flight Check**: Before pushing to remote, ensure that `npm run build:graph` and `npx astro build` execute locally with zero errors.

---

## 4. Repository Knowledge Architecture

To keep context windows small and prevent over-conservative agent behavior, repository details are split into specialized companion markdown files in the `docs/` folder.

If a task falls into one of these domains, read the corresponding document before writing code:

| Domain | Target Document | When to Read |
| --- | --- | --- |
| **Engineering** | `docs/ARCHITECTURE.md` | Editing Astro components, routing, configuration, styles, schemas, or API logic. |
| **Copywriting** | `docs/WRITING.md` | Modifying user-facing text, digest entries, research papers, or tone. |
| **Ontology** | `docs/THEORY.md` | Referencing AURORA, Bainbridge Warning, CIR, RSPS, and other core framework concepts. |
| **History & Issues** | `docs/STATUS.md` | Resolving active UX audit findings, tracking roadmaps, or referencing past changes. |
| **Design Rationales** | `docs/DECISIONS.md` | Understanding "the whys" behind the em-dash ban, Greek symbols, build order, etc. |

### Precedence Resolution Rule
If a task spans multiple domains, resolve them in this order:
1. **Status & History** (`docs/STATUS.md`)
2. **Engineering** (`docs/ARCHITECTURE.md`)
3. **Copywriting** (`docs/WRITING.md`)
4. **Ontology** (`docs/THEORY.md`)

---

## 5. Active Antigravity Capabilities

For Google Antigravity, workspace capabilities are registered in `.agents/skills.json` and are configured under `.agents/skills/`. They dynamically load the correct companion files in `docs/` based on user-prompt matching.
- **site-engineer**: Loads `docs/ARCHITECTURE.md`.
- **research-author**: Loads `docs/WRITING.md` and `docs/THEORY.md`.
- **deployment**: Loads `docs/ARCHITECTURE.md` and `docs/STATUS.md`.
- **framework-consultant**: Loads `docs/THEORY.md`.
- **generalist** (fallback): Loads `AGENTS.md` only.