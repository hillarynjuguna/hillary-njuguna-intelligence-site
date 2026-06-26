# Layered Knowledge Restructuring Implementation Plan

> **For Antigravity:** REQUIRED SUB-SKILL: Load executing-plans to implement this plan task-by-task.

**Goal:** Restructure the monolithic `AGENTS.md` in the `Projects/hillary-njuguna-intelligence-site/` folder into a clean, layered, portable architecture consisting of a root `AGENTS.md` (universal constitution), specialized companion files (`docs/`), and capability-oriented skills (`.agents/skills/`).

**Architecture:** Universal operational rules will be defined at the project root (`AGENTS.md`). Detailed domains will be mapped to clean markdown files in `docs/` (`ARCHITECTURE.md`, `WRITING.md`, `THEORY.md`, `STATUS.md`, and `DECISIONS.md`). Modular Antigravity capabilities will be placed under `.agents/skills/` and registered with the workspace via `.agents/skills.json`.

**Tech Stack:** Astro 5, Markdown, Antigravity Customizations.

---

### Task 1: Create the Companion Documentation Layer

**Files:**
- Create: `Projects/hillary-njuguna-intelligence-site/docs/ARCHITECTURE.md`
- Create: `Projects/hillary-njuguna-intelligence-site/docs/WRITING.md`
- Create: `Projects/hillary-njuguna-intelligence-site/docs/THEORY.md`
- Create: `Projects/hillary-njuguna-intelligence-site/docs/STATUS.md`
- Create: `Projects/hillary-njuguna-intelligence-site/docs/DECISIONS.md`

**Step 1: Write docs/ARCHITECTURE.md**
Write Content Schema definitions, Content collections folder mapping, Content graph build script description, dynamic API routes, Node environment variables and Astro SSR prerendering invariants.
Content to write:
```markdown
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

## Dynamic Edge API routes
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
```

**Step 2: Write docs/WRITING.md**
Write Greek symbols table, tone register constraints, no em-dashes rule, and model family name conventions.
Content to write:
```markdown
# Copywriting & Tone Guide

## Copywriting Constraints

### 1. No em-dashes
Never use em-dashes ( — ) in user-facing copy. Use commas, periods, colons, or rewrite the sentence entirely. Flag existing em-dashes if found in legacy content.

### 2. Name AI instruments by family
Never refer to specific version names of AI models in copy. Use their family name:
- **Correct**: Claude, GPT, Gemini, DeepSeek, Grok, Perplexity
- **Incorrect**: Claude Sonnet 4.6, GPT-4o, GPT-5.4, Gemini 2.0

### 3. Tone Register (Research Register)
Write about theoretical content from inside the framework — as established fact being formally documented, not as explanation to an unfamiliar reader.
- **Incorrect**: "AURORA proposes a concept called the Dual-Invariant Guarantee, which is..."
- **Correct**: "The Dual-Invariant Guarantee requires independent satisfaction of both conditions before any significant action executes."

## Greek Symbols Dictionary
Preserve these symbols exactly. Do not replace them with Latin approximations:
- `τ` (tau) — the human sovereign node
- `λ` (lambda) — AI instrument node
- `ρ` (rho) — memory/persistence node
- `χ` (chi) — the mortal asymmetry condition (χ=1)
- `φ` (phi) — field coherence
- `μ` (mu) — monitoring node
- `γ` (gamma) — generative parameter
- `Σ` (sigma) — constitutional perimeter layer
- `κ` (kappa) — holonomy measurement (Triangle Residue Test)
```

**Step 3: Write docs/THEORY.md**
Write definitions of the key frameworks: AURORA, Bainbridge Warning, CIR, DCFB, RSPS, The Orchestra, Eigenform, AOD.
Content to write:
```markdown
# Theoretical Frameworks Glossary

This document serves as the conceptual glossary for the frameworks published on this site.

- **AURORA**: Verifiable non-coercive AI consciousness architecture. Treats ethics as a structural invariant rather than an aspirational policy. Governed by the Dual-Invariant Guarantee.
- **Bainbridge Warning**: Institutional diagnostic for governance authenticity. Highlights the risk where high capability coupled with low governance leads to structural failures.
- **CIR (Cognitive Infrastructure Readiness)**: Five-dimension practitioner assessment: Intent Specification, Authority Architecture, Alignment Monitoring, Governance Scalability, Failure Mode Literacy.
- **DCFB (Distributed Cognition as Foundational Behavior)**: Theoretical foundation that intelligence distributes across systems and nodes, not inside them.
- **RSPS (Recursive Sovereign Project Space)**: Human (τ-node) sovereign orchestrator collaborating with differentiated AI instruments (λ-nodes).
- **The Orchestra**: The multi-model cognitive architecture consisting of seven AI models in distinct roles, guided by a human conductor.
- **Eigenform**: The stable cognitive shape generated by recursive self-observation.
- **Appearance/Outcome Decoupling (AOD)**: Structural decoupling of observable surfaces from generative depth across somatic, institutional, computational, theological, and financial registers.
```

**Step 4: Write docs/DECISIONS.md**
Write design rationales ("the whys").
Content to write:
```markdown
# Architectural Decisions (ADR)

This document captures the historical rationales behind repository rules to prevent future agents from rolling them back.

## 1. Graph Generation before Astro Build
- **Constraint**: `npm run build:graph` must execute before `npx astro build`.
- **Rationale**: The content graph is dynamically generated from content MDX frontmatter. Astro needs the generated JSON indexes to build page references. Reversing the order causes broken links and compilation failures.

## 2. Em-Dash Ban
- **Constraint**: Banned from all user-facing copy.
- **Rationale**: Em-dashes disrupt the specific editorial voice of the site, which calls for structured, academic, comma-separated, or colon-delimited phrasing.

## 3. Greek Symbols Preservation
- **Constraint**: Greek symbols must not be replaced by Latin versions.
- **Rationale**: These symbols represent specific variables in the sovereign cognition frameworks and carry precise mathematical and philosophical definitions.

## 4. Dual Environment Variables Pattern
- **Constraint**: Use `process.env.KEY ?? import.meta.env.KEY`.
- **Rationale**: The site deploys to Vercel Serverless Edge (which resolves `process.env`) but runs locally under Astro (which resolves `import.meta.env`). Simplification breaks production or local development.
```

**Step 5: Write docs/STATUS.md**
Write backlog issues (P0-P3), roadmaps, and history logs.
Content to write:
```markdown
# Project Status & Backlog

## UX Audit Findings (March 23, 2026)
- **P0**: Missing AURORA page on Vercel (needs `src/content/research/aurora-consciousness-architecture.mdx`).
- **P0**: Subheadline stacking unexplained terms. Translate terms before deploying.
- **P1**: Static synthesis examples should be increased to show, not tell.
- **P1**: Surface social proof and testimony.
- **P2**: Custom 404 page is missing.
- **P3**: Match corpus size promises to actual assistant limits.

## The Paid Tier Roadmap
1. Lemon Squeezy integration for membership.
2. Webhook handlers in `netlify/functions/` for membership sessions.
3. Neon database configuration.
4. Route protection `/member/*` config.

## Historical Session Log
- **April 26, 2026**: Clawdbot resolved MCP write lock issues. LogoEmblem.astro written. index.astro edits resolved via Python fallback script.
```

---

### Task 2: Create Portable Antigravity Capabilities (Skills)

**Files:**
- Create: `Projects/hillary-njuguna-intelligence-site/.agents/skills/site-engineer/SKILL.md`
- Create: `Projects/hillary-njuguna-intelligence-site/.agents/skills/research-author/SKILL.md`
- Create: `Projects/hillary-njuguna-intelligence-site/.agents/skills/deployment/SKILL.md`
- Create: `Projects/hillary-njuguna-intelligence-site/.agents/skills/framework-consultant/SKILL.md`
- Create: `Projects/hillary-njuguna-intelligence-site/.agents/skills/generalist/SKILL.md`

**Step 1: Write site-engineer/SKILL.md**
```markdown
---
name: site-engineer
description: "Use when modifying Astro components, routing, configuration, styles, or APIs in the Hillary Njuguna Intelligence Site."
domain: frontend-engineering
priority: 2
depends_on: none
---

# Site Engineer Capability

When active, read `docs/ARCHITECTURE.md` to understand Content Collections schemas, Astro config files, SSR patterns, and API routes.

## Forbidden Actions
- Do not modify theoretical definitions or alter copy tone guidelines.
- Do not introduce new frameworks or conceptual terms.
```

**Step 2: Write research-author/SKILL.md**
```markdown
---
name: research-author
description: "Use when authoring, editing, or reasoning about theoretical content, research entries, digest articles, or governance clauses."
domain: content-creation
priority: 3
depends_on: none
---

# Research Author Capability

When active, read `docs/WRITING.md` and `docs/THEORY.md` to ensure perfect alignment with copywriting style, the research register register, punctuation rules, and model family designations.

## Forbidden Actions
- Do not modify build systems, routing files, or server configurations.
- Do not violate the em-dash ban under any circumstances.
```

**Step 3: Write deployment/SKILL.md**
```markdown
---
name: deployment
description: "Use when preparing deployments, releasing changes, or running checks for Vercel/Astro builds."
domain: operations
priority: 1
depends_on: none
---

# Deployment Capability

When active, read `docs/ARCHITECTURE.md` and `docs/STATUS.md` to review the pre-flight checklists, build order requirements, and outstanding backlog audits.

## Forbidden Actions
- Do not push changes to `main` without verifying a successful local build.
- Do not rewrite theoretical text in `docs/THEORY.md`.
```

**Step 4: Write framework-consultant/SKILL.md**
```markdown
---
name: framework-consultant
description: "Use when responding to conceptual questions or analyzing the relationships between AURORA, CIR, DCFB, RSPS, and other core framework concepts."
domain: consulting
priority: 4
depends_on: none
---

# Framework Consultant Capability

When active, read `docs/THEORY.md` to ground definitions of framework systems.

## Forbidden Actions
- Do not make changes to code structure, routing, or deployment settings.
```

**Step 5: Write generalist/SKILL.md**
```markdown
---
name: generalist
description: "Use when the task does not match any specialized capability (e.g., general query, repo analysis, config setup)."
domain: general
priority: 5
depends_on: none
---

# Generalist Capability (Fallback)

When active, read only `AGENTS.md`. 

## Forbidden Actions
- Prohibited from modifying any domain-specific files (`docs/THEORY.md`, `docs/WRITING.md`, `docs/ARCHITECTURE.md`) unless explicitly instructed by the human sovereign (τ-node).
```

---

### Task 3: Configure Antigravity Discovery

**Files:**
- Create/Modify: `C:\Users\jacef\Desktop\hilla\.agents/skills.json`

**Step 1: Write workspace skills.json**
Create or update `skills.json` under `.agents/` in the workspace root `C:\Users\jacef\Desktop\hilla/.agents/skills.json` to register the new project-level skills folder:
```json
{
  "entries": [
    { "path": "Projects/hillary-njuguna-intelligence-site/.agents/skills" }
  ]
}
```

---

### Task 4: Rewrite AGENTS.md

**Files:**
- Modify: `Projects/hillary-njuguna-intelligence-site/AGENTS.md`

**Step 1: Write root AGENTS.md**
Overwrite the root `AGENTS.md` file completely to contain only the universal operating rules and pointers to the companion documents.

---

### Task 5: Build Verification

**Step 1: Run the build pipeline**
Run:
```bash
npm run build:graph
npx astro build
```
in `Projects/hillary-njuguna-intelligence-site/` and verify that the build succeeds.
