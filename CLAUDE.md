# CLAUDE.md — Oscillatory Fields Site Constitutional Constraints
# Created: March 2026 | Update when architectural decisions are made

## Architecture
- Astro 5 app. Not a monolith. File-based routing in src/pages/.
- Content collections in src/content/ (research, digest, products, clauses, signals).
- API routes in src/pages/api/*.ts (serverless).
- Content graph artifacts generated to src/data/generated/.
- Build sequence: npm run build:graph && astro build.

## API Architecture — Do Not Break
- Dual-provider failover pattern remains active.
- Use server-side env vars only in API routes.
- Never expose secrets to client scripts.
- Preserve existing provider chain and retry posture.

## Identity
- Canonical assistant name: The Field.
- Replace legacy “Research Stack” phrasing in UI and prompts where applicable.

## Navigation
- Canonical order:
  Research · Products · Diagnostic · Assessment · Orchestra · Digest · Corpus · Contact

## Do Not Touch
- Hero headline: "Fear isn't a feeling — it's an architecture."
- Formspree endpoint: maqdrora
- Gumroad link: hillarynjuguna.gumroad.com/l/xlwin
- inferRelations.ts logic
- Clause generation logic
- AcheType Substack link

## Voice
- Precise, non-corporate, intellectually serious.
- Avoid corporate verbs (leverage, unlock, empower, synergize).
