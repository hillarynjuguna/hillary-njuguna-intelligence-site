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
