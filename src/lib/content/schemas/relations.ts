// ── Typed relation model ──────────────────────────────────────────────────────

/**
 * Explicit semantic relation types.
 *
 * Directional: edge goes FROM source TO target.
 * When reading: "source [type] target"
 *
 * e.g. "research-dcfb derives_from [nothing implied — it is foundational]"
 *      "product-cir prototype_for research-dcfb" — WRONG direction
 *      "research-dcfb prototype_for product-cir" — correct: research is the basis for product
 *
 * Convention: the more foundational item is usually the source for
 * derives_from and crystallizes. The higher-level item is the source for prototype_for.
 */
export type RelationType =
  | 'extends'                  // This deepens or expands the target
  | 'derives_from'             // This was generated from or grounded in the target
  | 'responds_to'              // This is a direct response, correction, or engagement
  | 'tensions_with'            // This creates productive conceptual friction with the target
  | 'clarifies'                // This resolves ambiguity in the target
  | 'depends_on'               // This cannot be understood without the target
  | 'governance_relevant_to'   // This has governance implications for the target
  | 'prototype_for'            // This is an applied/operational surface of the target
  | 'example_of'               // This is a concrete case instantiating the target
  | 'contraindicates'          // Using this alongside the target is structurally problematic
  | 'crystallizes'             // This formalizes or stabilizes emergent ideas from the target
  | 'remains_emergent_with';   // This shares unresolved open edges with the target

export type RelationConfidence = 'low' | 'medium' | 'high';

export interface RelationInput {
  targetId: string;
  type: RelationType;
  confidence: RelationConfidence;
  /** Human-readable explanation of why this relation holds. Required. */
  explanation: string;
  /** Anchors in the source content supporting this relation (e.g. section names) */
  provenance?: string[];
  /** True when authored in frontmatter by a human. Used to rank above inferred relations. */
  manual?: boolean;
}

// ── Relation type metadata ────────────────────────────────────────────────────

export const RELATION_LABELS: Record<RelationType, string> = {
  extends: 'Extends',
  derives_from: 'Derives from',
  responds_to: 'Responds to',
  tensions_with: 'Tensions with',
  clarifies: 'Clarifies',
  depends_on: 'Depends on',
  governance_relevant_to: 'Governance-relevant to',
  prototype_for: 'Prototype for',
  example_of: 'Example of',
  contraindicates: 'Contraindicates',
  crystallizes: 'Crystallizes',
  remains_emergent_with: 'Remains emergent with',
};

export const RELATION_DESCRIPTION: Record<RelationType, string> = {
  extends: 'Deepens or expands the conceptual work',
  derives_from: 'Generated from or grounded in',
  responds_to: 'Direct engagement, response, or correction',
  tensions_with: 'Creates productive conceptual friction',
  clarifies: 'Resolves ambiguity or adds precision',
  depends_on: 'Cannot stand without the target',
  governance_relevant_to: 'Has direct governance implications for',
  prototype_for: 'Applied or operational surface of the research',
  example_of: 'Concrete case instantiating the concept',
  contraindicates: 'Using together creates structural problems',
  crystallizes: 'Formalizes or stabilizes emergent ideas',
  remains_emergent_with: 'Shares unresolved open edges with',
};

/** Relations that should never be inferred — require manual authorship */
export const MANUAL_ONLY_RELATIONS: RelationType[] = [
  'contraindicates',
  'depends_on',
  'crystallizes',
  'extends',
];

/** Relations safe to infer from structural overlap */
export const INFERABLE_RELATIONS: RelationType[] = [
  'clarifies',
  'example_of',
  'governance_relevant_to',
  'remains_emergent_with',
];

export const ALL_RELATION_TYPES: RelationType[] = [
  'extends',
  'derives_from',
  'responds_to',
  'tensions_with',
  'clarifies',
  'depends_on',
  'governance_relevant_to',
  'prototype_for',
  'example_of',
  'contraindicates',
  'crystallizes',
  'remains_emergent_with',
];

export const ALL_CONFIDENCE_VALUES: RelationConfidence[] = ['low', 'medium', 'high'];
