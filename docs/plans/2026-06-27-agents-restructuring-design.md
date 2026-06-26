# Design: Portable Capability-Oriented Knowledge Architecture for AI Collaborators

**Last Updated**: June 27, 2026  
**Status**: APPROVED  
**Target Repository**: `Projects/hillary-njuguna-intelligence-site/`  

---

## 1. Executive Summary

This design restructures the monolithic `AGENTS.md` in the project root into a clean, layered knowledge architecture. It addresses the issues of cognitive context bloating, cold-context poisoning, and over-conservative agent behavior by decoupling universal repository operations from architectural, copywriting, ontological, and status concerns.

The resulting system is **repository-first** (fully portable and self-sufficient) with an **acceleration layer** of capability-oriented Antigravity skills.

---

## 2. Layered File Hierarchy (The Source of Truth)

All files reside inside the repository at `Projects/hillary-njuguna-intelligence-site/`. 

```text
Projects/hillary-njuguna-intelligence-site/
├── AGENTS.md               ← Universal engineering constitution (stable, always loaded)
├── CLAUDE.md               ← Claude-specific behaviors and quick commands
├── .agents/
│   └── skills/             ← Portable Antigravity skills committed to git
│       ├── site-engineer/   
│       ├── research-author/
│       ├── deployment/
│       ├── framework-consultant/
│       └── generalist/
└── docs/
    ├── ARCHITECTURE.md     ← Build pipelines, schemas, SSR, content collections reference
    ├── WRITING.md          ← Tone guidelines, constraints (em-dashes, Greek symbols)
    ├── THEORY.md           ← Framework glossaries (AURORA, Bainbridge, CIR, DCFB, RSPS, Orchestra)
    ├── STATUS.md           ← Session history, active issues, UX audit findings, paid tier roadmap
    └── DECISIONS.md        ← Architectural rationales (why graph is first, why dual env vars, etc.)
```

### File Specifications

#### `AGENTS.md` (Universal Operating Constitution)
- **Purpose**: Defines mandatory engineering rules, build constraints, and deployment gates. It remains clean, purely operational, and stable (~400–600 lines max).
- **Core Sections**:
  - Environment invariants (Astro 5, Vercel Serverless).
  - Build pipeline sequence (`build:graph` then `astro build`).
  - Prerendering policy (`prerender = true` for static-capable pages).
  - Git branch and commit format gates.
  - **Knowledge Routing Directives** mapping tasks to relative markdown files in `docs/` (e.g. "If task involves Astro components, read `docs/ARCHITECTURE.md`").

#### `docs/ARCHITECTURE.md` (Engineering Reference)
- **Purpose**: A reference manual for the code base structure.
- **Contents**: Content collection directories, schemas (`src/content/config.ts`), build graph scripts, API failover patterns, and edge API architectures.

#### `docs/WRITING.md` (Tone & Copy Guide)
- **Purpose**: Editorial guidelines for user-facing copy.
- **Contents**: The research register tone rules, Greek symbol dictionary, model naming conventions, and the zero em-dash constraint.

#### `docs/THEORY.md` (Theoretical Glossary)
- **Purpose**: Reference for internal frameworks.
- **Contents**: Definitions and relationships for AURORA, Bainbridge Warning, CIR, DCFB, RSPS, The Orchestra, Eigenform, and AOD.

#### `docs/DECISIONS.md` (Design Rationale / "The Whys")
- **Purpose**: Rationale history to prevent future agents from dismantling intentional design trade-offs.
- **Contents**: Detailed explanation of build ordering, em-dash bans, Greek symbols preservation, dual env vars, and SSR prerender canonical flags.

#### `docs/STATUS.md` (Active Roadmap & Audit Progress)
- **Purpose**: Dynamic sprint-level log.
- **Contents**: Audit findings backlog (P0-P3), Lemon Squeezy paid tier roadmap, and short session logs.

---

## 3. Capability Skills Layer (The Acceleration Layer)

Skills are located in `Projects/hillary-njuguna-intelligence-site/.agents/skills/`. They act as behaviors that selectively load knowledge files based on the task description.

### Dynamic Skill Definitions

#### 1. `site-engineer`
- **Trigger**: "Use when modifying Astro components, routing, configuration, styles, or APIs in the Hillary Njuguna Intelligence Site."
- **Metadata**:
  - `domain`: frontend-engineering
  - `priority`: 2
  - `depends_on`: none
- **Behavior Directive**: Loads `docs/ARCHITECTURE.md`.
- **Forbidden Actions**:
  - Do not modify theoretical content or change writing style guidelines.
  - Do not introduce new frameworks.

#### 2. `research-author`
- **Trigger**: "Use when authoring, editing, or reasoning about theoretical content, research entries, digest articles, or governance clauses."
- **Metadata**:
  - `domain`: content-creation
  - `priority`: 3
  - `depends_on`: none
- **Behavior Directive**: Loads `docs/WRITING.md` and `docs/THEORY.md`.
- **Forbidden Actions**:
  - Do not modify build scripts, API routing logic, or deployment configs.
  - Do not violate the em-dash ban.

#### 3. `deployment`
- **Trigger**: "Use when preparing deployments, releasing changes, or running checks for Vercel/Astro builds."
- **Metadata**:
  - `domain`: operations
  - `priority`: 1
  - `depends_on`: none
- **Behavior Directive**: Loads `docs/ARCHITECTURE.md` and `docs/STATUS.md`.
- **Forbidden Actions**:
  - Do not commit changes to main without a successful local build gate run.
  - Do not modify core framework definitions in `docs/THEORY.md`.

#### 4. `framework-consultant`
- **Trigger**: "Use when responding to conceptual questions or analyzing the relationships between AURORA, CIR, DCFB, RSPS, and other core framework concepts."
- **Metadata**:
  - `domain`: consulting
  - `priority`: 4
  - `depends_on`: none
- **Behavior Directive**: Loads `docs/THEORY.md`.
- **Forbidden Actions**:
  - Do not rewrite or modify coding structures or deployment configs.

#### 5. `generalist` (Fallback Skill)
- **Trigger**: "Use when the task does not match any specialized capability (e.g., general query, repo analysis, config setup)."
- **Metadata**:
  - `domain`: general
  - `priority`: 5
  - `depends_on`: none
- **Behavior Directive**: Loads only `AGENTS.md`.
- **Forbidden Actions**:
  - Prohibited from modifying any domain-specific docs (`docs/THEORY.md`, `docs/WRITING.md`, `docs/ARCHITECTURE.md`) unless explicitly instructed by the human sovereign (τ-node).

---

## 4. Boundary & Ambiguity Enforcement

### Precedence Resolution Rule
If a task matches multiple capabilities, the following priority order governs which behavior runs:
1. `deployment` (Priority 1)
2. `site-engineer` (Priority 2)
3. `research-author` (Priority 3)
4. `framework-consultant` (Priority 4)
5. `generalist` (Priority 5)

---

## 5. Portability and Antigravity Wiring

1. The `.agents/skills` folder remains committed to Git inside the repository, maintaining full portability.
2. In the parent workspace configuration (`C:\Users\jacef\Desktop\hilla/.agents/skills.json`), we register this folder:
   ```json
   {
     "entries": [
       { "path": "Projects/hillary-njuguna-intelligence-site/.agents/skills" }
     ]
   }
   ```
3. Relative path mapping is enforced universally (e.g., `docs/ARCHITECTURE.md` instead of absolute `file:///` URIs) to support portability across all containerized, local, or remote agent environments.
