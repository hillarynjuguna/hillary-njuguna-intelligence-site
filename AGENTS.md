# AGENTS.md — Oscillatory Fields Site
# Repository: hillarynjuguna/hillary-njuguna-intelligence-site
# Constitutional rules for all agentic sessions (Codex, Claude Code, 
# or any automated agent working in this codebase)
# Last updated: March 23, 2026

---

## WHO THIS SITE IS

This is the research and consulting platform for Oscillatory Fields —
the public transmission layer for a theoretical corpus built across
18 months of multi-model synthesis. The frameworks deployed here
(Bainbridge Warning, CIR, DCFB, AURORA, RSPS) are not marketing copy.
They are the output of a living research process.

The site's primary design imperative, as identified by cold-context
UX audit: shift from describing the methodology to demonstrating it.
Every agent session should move the demonstration/description ratio
toward demonstration.

The τ-node (Hillary Njuguna) is the human sovereign for this
repository. All significant architectural decisions require τ-node
review before deployment to main.

---

## NON-NEGOTIABLE STYLE RULES

These rules apply to every string of user-facing copy you write,
edit, or touch. No exceptions.

### 1. No em-dashes
Never use em-dashes ( — ) in user-facing copy.
Use commas, periods, colons, or rewrite the sentence entirely.
If you find existing em-dashes in source files, flag them.
Do not silently leave them in place.

### 2. Preserve Greek symbols exactly
These symbols appear throughout the codebase and carry precise
theoretical meaning. Never replace them with Latin approximations.

  τ (tau)     — the human sovereign node
  λ (lambda)  — AI instrument node
  ρ (rho)     — memory/persistence node
  χ (chi)     — the mortal asymmetry condition (χ=1)
  φ (phi)     — field coherence
  μ (mu)      — monitoring node
  γ (gamma)   — generative parameter
  Σ (sigma)   — constitutional perimeter layer
  κ (kappa)   — holonomy measurement (Triangle Residue Test)

### 3. Name AI instruments by family, never by version
Users should not need to know which model version powered a
synthesis. The instrument identity is the role, not the release.

  CORRECT:    Claude, GPT, Gemini, DeepSeek, Grok, Perplexity
  INCORRECT:  Claude Sonnet 4.6, GPT-4o, GPT-5.4, Gemini 2.0

### 4. Research register for theoretical content
When writing body copy for research entries, digest entries, or
any content that surfaces the theoretical corpus, write from inside
the framework — as established fact being formally documented,
not as explanation to an unfamiliar reader.

Wrong register: "AURORA proposes a concept called the
                Dual-Invariant Guarantee, which is..."
Right register: "The Dual-Invariant Guarantee requires independent
                satisfaction of both conditions before any
                significant action executes."

The frameworks are real. Write as if they are.

---

## ARCHITECTURE — KNOW THIS BEFORE TOUCHING FILES

### Content collections
All site content lives in:
  src/content/research/     — theoretical framework entries (.mdx)
  src/content/digest/       — field notes and synthesis dispatches (.mdx)
  src/content/products/     — product and service entries (.mdx)
  src/content/clauses/      — governance clause candidates (.mdx)
  src/content/signals/      — field signal analyses (.mdx)

Schemas live in:
  src/content/config.ts
  src/lib/content/schemas/*.ts

### Build pipeline (order matters)
Always run in this sequence:
  1. npm run build:graph     — regenerates src/data/generated/*.json
  2. npx astro build         — compiles the full site

If you reverse the order, or skip build:graph, content graph
relations will not resolve and the deployed site will have
broken cross-references.

### API routes
All API routes use the dual environment pattern:
  process.env.KEY ?? import.meta.env.KEY

Never simplify this to just one form. The dual pattern exists
because the site runs in both local dev (import.meta.env) and
Vercel serverless (process.env) contexts. Breaking this pattern
silently breaks API routes in one environment.

### Node.js version mismatch
Local environment: Node.js v24
Vercel serverless runtime: Node.js v22

Do not introduce Node.js 24-specific APIs in any server-side code.
The build will pass locally and silently fail in deployment.

### Graph pipeline note
The content graph (content-graph.json, relation-index.json,
taxonomy-index.json, governance-index.json) is generated from
frontmatter fields in content files. Key fields the graph reads:

  lineage, domains, governanceRelevance, explicitRelations,
  crystallization, researchType, keyClaims, unresolvedEdges

If build:graph reports 0 nodes, 0 edges — the content files
are missing these frontmatter fields or the graph script has
a path resolution issue. Flag this rather than ignoring it.

### Generated files and git
Files in src/data/generated/ are build artifacts.
Check whether .gitignore excludes them before committing.
If they are excluded, do not add them to commits.
If they are tracked, generate them fresh before committing
to avoid overwriting a content-rich graph with an empty one.

---

## DEPLOYMENT RULES

### Branch
Deploy to main only. Vercel auto-deploys from main.
Do not push to other branches unless creating a PR for review.
The existing claude/* branches are archaeological — do not
add new ones without explicit τ-node instruction.

### Build gate
Before any git push, the following must pass with zero errors:
  npm run build:graph
  npx astro build

A warning is not an error. A warning about Node.js version
mismatch is expected and acceptable. Actual build errors
block deployment.

### Commit message format
Use the format:
  type: short description

  Longer explanation if needed. Reference which audit findings
  or Insight Log entries the changes address.

  Closes #issue-number (if applicable)

Types: feat, fix, chore, content, refactor, style

---

## CONTENT CREATION GUIDELINES

### Research entries (src/content/research/)
Required frontmatter fields:
  id, title, description, researchType, keyClaims, unresolvedEdges,
  domains, lineage, crystallization, governanceRelevance, tags,
  excerpt, featured, draft, author

  crystallization values: emerging | developing | crystallized
  governanceRelevance values: direct | indirect | foundational

The unresolvedEdges field is not a weakness — it is an epistemic
commitment. Name what the argument has not yet resolved. Research
documents name their open edges. Position papers hide them.

### Digest entries (src/content/digest/)
Field notes are written during active synthesis, not after.
The voice is first-person, present-tense, discovery-oriented.
They do not explain the framework to the reader.
They demonstrate the framework encountering a live problem.

### Clause entries (src/content/clauses/)
Clauses are governance principles that have crystallized from
the research. They carry a crystallizationThreshold — a measure
of how much evidence and deliberation has accumulated.
Never set a new clause to crystallized without τ-node approval.

---

## AUDIT FINDINGS TO HOLD IN MIND

The following structural issues were identified by a cold-context
UX audit (Apple HI x DeepMind methodology, March 23, 2026).
Every agent session should move toward resolving them:

P0 — AURORA research entry was returning a raw Vercel 404.
     The MDX file must exist at src/content/research/
     aurora-consciousness-architecture.mdx with draft: false.

P0 — Homepage subheadline was stacking three unexplained
     proprietary terms (DCFB, CIR, constitutional AI governance).
     User-facing subheadlines should carry one concept per sentence
     with a translation layer before deploying proprietary vocabulary.

P1 — Site runs at 70% description / 30% demonstration ratio.
     Every session should shift this toward demonstration.
     Static synthesis examples outperform methodology descriptions.

P1 — Zero social proof anywhere on the site.
     When early users provide testimony, surface it.

P2 — Custom 404 page did not exist.
     Any missing page should route to a branded 404,
     never to a raw Vercel error.

P3 — Corpus promise (560+ documents, queryable, alive) runs
     ahead of corpus delivery (AI assistant in early deployment).
     Copy should match the current state honestly.

---

## THEORETICAL CONTEXT (for agents writing copy)

These are the frameworks this site publishes. Know their
relationships before writing about them.

AURORA       — Verifiable non-coercive AI consciousness architecture.
               Ethics as structural invariant, not aspirational policy.
               The Dual-Invariant Guarantee is its core mechanism.
               Parent framework: generates the constitutional principles
               that govern all other frameworks.

Bainbridge   — Governance framework for institutional AI failure.
Warning        Pattern: high capability + low governance = predictable
               catastrophe. Named for the structural condition, not
               a person. The institutional diagnostic.

CIR          — Cognitive Infrastructure Readiness. Five-dimension
               assessment: Intent Specification, Authority Architecture,
               Alignment Monitoring, Governance Scalability,
               Failure Mode Literacy. The practitioner tool.

DCFB         — Distributed Cognition as Foundational Behavior.
               Intelligence distributes across systems, not inside them.
               The unit of cognitive analysis must shift from the
               individual node to the field.

RSPS         — Recursive Sovereign Project Space. The multi-model
               cognitive architecture. The human (τ-node) as sovereign
               orchestrator of differentiated AI instruments (λ-nodes).

The Orchestra — Seven AI models, each playing a distinct cognitive role.
               Intelligence emerges from the field between them.
               The Conductor is always human.

Eigenform    — The stable shape that recursive cognition generates
               when applied to itself. A system's eigenform is what
               it recognizes as itself across contexts.

AOD          — Appearance/Outcome Decoupling. The structural principle
               where observable surface is systematically decoupled from
               generative depth. Operates across somatic, institutional,
               computational, theological, and financial registers.

Bainbridge Warning is the institutional diagnostic.
AURORA is the architectural answer.
CIR is the assessment instrument.
DCFB is the theoretical foundation.
RSPS is the operational methodology.
The Orchestra is the live demonstration.

---

## WHAT THIS SITE IS NOT

Not a startup. Not a personal blog. Not a consultancy with
standard service lines. This is the public transmission layer
of a research corpus that took 18 months to build, draws on
560+ source documents, and independently converged with
peer-reviewed neuroscience literature and Anthropic's
constitutional training document.

Write accordingly.

---
# End of AGENTS.md
# This file is read by all agentic sessions operating in this repo.
# Update it when constitutional rules change.
# Do not update it to override τ-node decisions.