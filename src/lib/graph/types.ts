import type { RelationType, RelationConfidence } from '../content/schemas/relations';
import type { CrystallizationState, GovernanceRelevance, ContentType, PublishStatus } from '../content/schemas/base';

export type { RelationType, RelationConfidence, CrystallizationState, GovernanceRelevance, ContentType };

// ── Core graph node ───────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  slug: string;
  title: string;
  description: string;
  contentType: ContentType;
  status: PublishStatus;
  crystallization: CrystallizationState;
  governanceRelevance: GovernanceRelevance;
  domains: string[];
  themes: string[];
  tags: string[];
  lineage: string[];
  sourceCollection: string;
  /** ISO date string */
  publishedAt?: string;
  /** ISO date string */
  updatedAt?: string;
  /** Clause-specific: governance domain */
  governanceDomain?: string;
  /** Clause-specific */
  clauseStatus?: string;
  /** Clause-specific: threshold 0.0–1.0 */
  crystallizationThreshold?: number;
  /** Clause-specific: content IDs providing support */
  supportingContentIds?: string[];
  /** Clause-specific */
  objections?: string[];
  /** Research-specific: named open questions */
  unresolvedEdges?: string[];
  /** Research-specific */
  keyClaims?: string[];
  /** Product-specific */
  relatedResearch?: string[];
  /** Product-specific */
  governanceNotes?: string[];
}

// ── Typed edge ────────────────────────────────────────────────────────────────

export interface GraphEdge {
  source: string;
  target: string;
  type: RelationType;
  confidence: RelationConfidence;
  explanation: string;
  provenance: string[];
  manual: boolean;
  inferred: boolean;
}

// ── Complete graph ────────────────────────────────────────────────────────────

export interface ContentGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  generatedAt: string;
  /** Summary counts */
  stats: {
    totalNodes: number;
    totalEdges: number;
    manualEdges: number;
    inferredEdges: number;
    byType: Record<ContentType, number>;
  };
}

// ── Relation index ────────────────────────────────────────────────────────────

export interface RelationIndexEntry {
  target: string;
  type: RelationType;
  confidence: RelationConfidence;
  explanation: string;
  manual: boolean;
  inferred: boolean;
}

export interface RelationIndex {
  bySource: Record<string, RelationIndexEntry[]>;
  byTarget: Record<string, RelationIndexEntry[]>;
  generatedAt: string;
}

// ── Taxonomy index ────────────────────────────────────────────────────────────

export interface TaxonomyGroup {
  label: string;
  contentIds: string[];
  count: number;
}

export interface TaxonomyIndex {
  domains: Record<string, TaxonomyGroup>;
  themes: Record<string, TaxonomyGroup>;
  tags: Record<string, TaxonomyGroup>;
  lineage: Record<string, TaxonomyGroup>;
  generatedAt: string;
}

// ── Governance index ──────────────────────────────────────────────────────────

export interface GovernanceClauseEntry {
  id: string;
  title: string;
  clauseStatus: string;
  governanceDomain: string;
  crystallizationThreshold: number;
  supportingContentIds: string[];
  objections: string[];
  crystallization: CrystallizationState;
}

export interface GovernanceAdjacency {
  contentId: string;
  contentTitle: string;
  contentType: ContentType;
  clauseIds: string[];
  governanceRelevance: GovernanceRelevance;
}

export interface GovernanceIndex {
  clauses: GovernanceClauseEntry[];
  adjacency: GovernanceAdjacency[];
  byDomain: Record<string, string[]>; // domain → clause ids
  generatedAt: string;
}

// ── Related content result ────────────────────────────────────────────────────

export interface RelatedItem {
  node: GraphNode;
  edge: GraphEdge;
  /** Human-readable reason for this relation */
  reason: string;
  /** Short label (e.g. "Derives from") */
  relationLabel: string;
  score: number;
}
