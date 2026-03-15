---
id: clause-irreversibility-threshold
title: "Irreversibility Threshold Review Requirement"
description: "Every AI deployment decision crossing a significant irreversibility threshold must trigger an explicit governance review with named accountable authority."
clauseText: "Every AI deployment decision that crosses a significant irreversibility threshold — where the cost of reversal exceeds the cost of continued deployment — must trigger an explicit governance review with named accountable authority and documented rationale. This threshold must be determined before deployment, not discovered after."
sourceContext: "Derived from the Trust = Irreversibility Residue theoretical framework. Addresses the failure mode of discovering governance requirements at the point of crisis."
generatedAt: 2026-01-28
publishedAt: 2026-01-28
clauseStatus: candidate
governanceDomain: agentic-behavior
crystallizationThreshold: 0.7
supportingContentIds:
  - research-trust-irreversibility-residue
  - research-bainbridge-warning
tags: ["irreversibility", "trust", "governance-review", "deployment", "accountability"]
domains: ["governance", "deployment-authority"]
lineage: ["dcfb-core", "constitutional-ai"]
crystallization: developing
governanceRelevance: direct
status: "candidate"
visibility: "public"
objections:
  - "Irreversibility thresholds are context-dependent and difficult to pre-specify universally."
  - "Named accountable authority may be unclear in distributed or federated deployment architectures."
applicability: "Applies to all AI deployment decisions in production contexts where reversal would require significant resource expenditure or create downstream institutional dependencies."
reviewCadence: quarterly
notes: "Core clause from the irreversibility account of trust. High priority for institutional deployment frameworks."
explicitRelations:
  - targetId: research-trust-irreversibility-residue
    type: derives_from
    confidence: high
    explanation: "This clause is the direct governance operationalisation of the Trust = Irreversibility Residue framework — the 'Clause Candidate' section of that paper is this clause verbatim."
    provenance: ["section: Clause Candidate"]
    manual: true
  - targetId: research-dcfb
    type: governance_relevant_to
    confidence: high
    explanation: "DCFB Principle 4 (distributed monitoring) requires knowing when deployment decisions cross irreversibility thresholds — this clause formalises that governance trigger."
    provenance: ["section: Governance requirements change"]
    manual: true
  - targetId: research-bainbridge-warning
    type: governance_relevant_to
    confidence: high
    explanation: "The Bainbridge Warning gap analysis directly identifies irreversibility threshold failures as a primary Bainbridge zone — this clause is the governance response to that diagnosis."
    provenance: ["section: Gap Analysis"]
    manual: true
---

## Clause Text

Every AI deployment decision that crosses a significant irreversibility threshold — where the cost of reversal exceeds the cost of continued deployment — must trigger an explicit governance review with named accountable authority and documented rationale. This threshold must be determined before deployment, not discovered after.

## Source

Derived from the Trust = Irreversibility Residue framework. The core claim: trust is not a feeling but a structural property measured by accumulated irreversibility. Governance must be calibrated to irreversibility, not just to confidence metrics.

## Status

**Candidate** — High priority candidate for institutional governance frameworks. Addresses a structural gap in most current AI deployment procedures.

## Related Content

- [Trust = Irreversibility Residue →](/research/trust-irreversibility-residue)
- [The Bainbridge Warning →](/research/bainbridge-warning)
- [CIR v2.0 →](/products/cir)
