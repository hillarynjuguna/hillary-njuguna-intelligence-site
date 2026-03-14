---
id: clause-intent-specification
title: "Intent Specification Requirement"
description: "Organisations must demonstrate — not merely assert — that their AI system's optimisation target corresponds to stated organisational intent."
clauseText: "Organisations deploying AI systems must be able to demonstrate, not merely assert, that the system's optimisation target corresponds to their stated organisational intent. This requires live monitoring, interpretability access, and a documented theory of how alignment is maintained over time — not just at point of deployment."
sourceContext: "Synthesised from analysis of the intent gap in AI deployment contexts. Related to CIR Dimension 1: Intent Specification."
generatedAt: 2026-02-27
publishedAt: 2026-02-27
clauseStatus: candidate
governanceDomain: epistemic-safety
crystallizationThreshold: 0.6
supportingContentIds:
  - digest-intent-gap-god-mode-biology
  - research-dcfb
tags: ["intent", "alignment", "monitoring", "deployment", "governance"]
domains: ["governance", "epistemics"]
lineage: ["dcfb-core", "constitutional-ai"]
crystallization: developing
governanceRelevance: direct
status: "candidate"
visibility: "public"
objections:
  - "Live monitoring requirements may be technically infeasible for all model types at this stage."
  - "Interpretability access is not uniformly available across vendors."
applicability: "Applies to organisations deploying AI systems in production contexts with consequential outputs."
reviewCadence: quarterly
notes: "Generated during synthesis of the intent gap analysis. Candidate for inclusion in constitutional governance framework."
explicitRelations:
  - targetId: research-dcfb
    type: governance_relevant_to
    confidence: high
    explanation: "DCFB Principle 1 (field-level capability assessment) directly motivates this clause — you cannot specify intent at the node level in a distributed cognitive field."
    provenance: ["section: What Changes When You Treat Cognition as Distributed"]
    manual: true
  - targetId: digest-intent-gap-god-mode-biology
    type: derives_from
    confidence: high
    explanation: "This clause was synthesised directly from the intent gap field notes — the clause text appears as the 'clause candidate from this synthesis' in that entry."
    provenance: ["section: The Intent Gap"]
    manual: true
  - targetId: product-cir
    type: governance_relevant_to
    confidence: high
    explanation: "This clause corresponds to CIR Dimension 1: Intent Specification — organisations that complete CIR are implicitly engaging with this clause requirement."
    provenance: ["section: Intent Specification"]
    manual: true
---

## Clause Text

Organisations deploying AI systems must be able to demonstrate, not merely assert, that the system's optimisation target corresponds to their stated organisational intent. This requires live monitoring, interpretability access, and a documented theory of how alignment is maintained over time — not just at point of deployment.

## Source

This clause emerged from synthesis work on the intent gap in AI deployment contexts. The core insight: the burden of proof for alignment should be on the deployer, not assumed from training data or initial testing.

## Status

**Candidate** — Under consideration for the constitutional governance framework. Not yet adopted.

## Related Content

- [The Intent Gap →](/digest/intent-gap-god-mode-biology)
- [DCFB Framework →](/research/dcfb-distributed-cognition)
- [CIR v2.0 →](/products/cir)
