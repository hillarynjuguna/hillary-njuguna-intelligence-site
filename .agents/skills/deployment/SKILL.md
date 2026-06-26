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
