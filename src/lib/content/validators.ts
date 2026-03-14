/**
 * Content validation utilities used by integrity check scripts.
 */
import type { GraphNode, GraphEdge } from '../graph/types';
import type { RelationInput } from './schemas/relations';
import { ALL_RELATION_TYPES, ALL_CONFIDENCE_VALUES, MANUAL_ONLY_RELATIONS } from './schemas/relations';
import { ALL_GOVERNANCE_DOMAINS, ALL_CLAUSE_STATUSES } from './schemas/clauses';

export interface ValidationError {
  level: 'error' | 'warn';
  code: string;
  nodeId?: string;
  message: string;
}

// ── Relation input validation ─────────────────────────────────────────────────

export function validateRelationInput(
  rel: Partial<RelationInput>,
  sourceId: string,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!rel.targetId) {
    errors.push({ level: 'error', code: 'MISSING_TARGET_ID', nodeId: sourceId, message: `Relation missing targetId in ${sourceId}` });
  }
  if (!rel.type || !ALL_RELATION_TYPES.includes(rel.type as never)) {
    errors.push({ level: 'error', code: 'INVALID_RELATION_TYPE', nodeId: sourceId, message: `Invalid relation type "${rel.type}" in ${sourceId}` });
  }
  if (!rel.confidence || !ALL_CONFIDENCE_VALUES.includes(rel.confidence as never)) {
    errors.push({ level: 'error', code: 'INVALID_CONFIDENCE', nodeId: sourceId, message: `Invalid confidence "${rel.confidence}" in ${sourceId}` });
  }
  if (!rel.explanation || rel.explanation.trim().length === 0) {
    errors.push({ level: 'error', code: 'MISSING_EXPLANATION', nodeId: sourceId, message: `Relation in ${sourceId} → ${rel.targetId} missing explanation` });
  }

  return errors;
}

// ── Node-level validation ─────────────────────────────────────────────────────

export function validateNode(node: GraphNode): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!node.id || node.id.trim().length === 0) {
    errors.push({ level: 'error', code: 'MISSING_ID', message: `Node with slug "${node.slug}" has empty id` });
  }
  if (!node.description || node.description.trim().length === 0) {
    errors.push({ level: 'warn', code: 'MISSING_DESCRIPTION', nodeId: node.id, message: `${node.id}: missing description` });
  }
  if (node.domains.length === 0 && node.themes.length === 0 && node.tags.length > 0) {
    errors.push({ level: 'warn', code: 'TAGS_ONLY', nodeId: node.id, message: `${node.id}: has tags but no domains or themes — consider adding structural taxonomy` });
  }

  // Clause-specific
  if (node.contentType === 'clause') {
    if (!node.governanceDomain || !ALL_GOVERNANCE_DOMAINS.includes(node.governanceDomain as never)) {
      errors.push({ level: 'error', code: 'INVALID_GOVERNANCE_DOMAIN', nodeId: node.id, message: `Clause ${node.id}: missing or invalid governanceDomain` });
    }
    if (!node.clauseStatus || !ALL_CLAUSE_STATUSES.includes(node.clauseStatus as never)) {
      errors.push({ level: 'error', code: 'INVALID_CLAUSE_STATUS', nodeId: node.id, message: `Clause ${node.id}: missing or invalid clauseStatus` });
    }
    if (!node.supportingContentIds || node.supportingContentIds.length === 0) {
      errors.push({ level: 'error', code: 'MISSING_SUPPORTING_CONTENT', nodeId: node.id, message: `Clause ${node.id}: must have at least one supportingContentId` });
    }
  }

  return errors;
}

// ── Graph-level validation ────────────────────────────────────────────────────

export function validateGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
): ValidationError[] {
  const errors: ValidationError[] = [];
  const nodeIds = new Set(nodes.map((n) => n.id));

  // Check for duplicate IDs
  const seen = new Set<string>();
  for (const node of nodes) {
    if (seen.has(node.id)) {
      errors.push({ level: 'error', code: 'DUPLICATE_ID', nodeId: node.id, message: `Duplicate node id: ${node.id}` });
    }
    seen.add(node.id);
  }

  // Validate edges
  for (const edge of edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push({ level: 'error', code: 'DANGLING_SOURCE', message: `Edge source "${edge.source}" does not exist` });
    }
    if (!nodeIds.has(edge.target)) {
      errors.push({ level: 'error', code: 'DANGLING_TARGET', message: `Edge target "${edge.target}" from "${edge.source}" does not exist` });
    }
    if (!edge.explanation || edge.explanation.trim().length === 0) {
      errors.push({ level: 'error', code: 'MISSING_EDGE_EXPLANATION', message: `Edge ${edge.source} → ${edge.target} missing explanation` });
    }
    if (edge.inferred && MANUAL_ONLY_RELATIONS.includes(edge.type)) {
      errors.push({ level: 'error', code: 'INFERRED_MANUAL_ONLY_RELATION', message: `Edge ${edge.source} → ${edge.target} uses manual-only type "${edge.type}" but is marked inferred` });
    }
  }

  return errors;
}

// ── Orphan and coverage warnings ─────────────────────────────────────────────

export function checkOrphans(nodes: GraphNode[], edges: GraphEdge[]): ValidationError[] {
  const warnings: ValidationError[] = [];
  const connected = new Set([...edges.map((e) => e.source), ...edges.map((e) => e.target)]);

  for (const node of nodes) {
    if (!connected.has(node.id)) {
      warnings.push({ level: 'warn', code: 'ORPHAN_NODE', nodeId: node.id, message: `${node.id}: no edges — orphan node` });
    }
  }
  return warnings;
}

export function checkGovernanceCoverage(nodes: GraphNode[], edges: GraphEdge[]): ValidationError[] {
  const warnings: ValidationError[] = [];
  const clauses = nodes.filter((n) => n.contentType === 'clause');
  const clauseIds = new Set(clauses.map((c) => c.id));

  // Products with no research linkage
  const products = nodes.filter((n) => n.contentType === 'product');
  for (const product of products) {
    const hasResearchLink = edges.some(
      (e) => e.source === product.id || e.target === product.id
    ) || (product.relatedResearch && product.relatedResearch.length > 0);

    if (!hasResearchLink) {
      warnings.push({ level: 'warn', code: 'PRODUCT_NO_RESEARCH', nodeId: product.id, message: `Product ${product.id}: no research linkage found` });
    }
  }

  // Governance-relevant content with no clause adjacency
  const govRelevant = nodes.filter((n) => n.governanceRelevance === 'direct' && n.contentType !== 'clause');
  for (const node of govRelevant) {
    const linkedToClause = edges.some(
      (e) => (e.source === node.id && clauseIds.has(e.target)) ||
              (e.target === node.id && clauseIds.has(e.source))
    );
    if (!linkedToClause) {
      warnings.push({ level: 'warn', code: 'GOVERNANCE_NO_CLAUSE', nodeId: node.id, message: `${node.id}: marked governance-direct but has no clause adjacency` });
    }
  }

  return warnings;
}
