/**
 * Normalizes raw content entries (from gray-matter loaders) into GraphNode objects.
 * Handles missing/optional fields, derives IDs from slugs when not authored.
 */
import type { RawEntry, CollectionName } from './loaders';
import type { GraphNode } from '../graph/types';
import type { CrystallizationState, GovernanceRelevance, ContentType, PublishStatus } from './schemas/base';
import type { RelationInput } from './schemas/relations';
import { ALL_RELATION_TYPES, ALL_CONFIDENCE_VALUES } from './schemas/relations';

// ── ID derivation ─────────────────────────────────────────────────────────────

const COLLECTION_PREFIX: Record<CollectionName, string> = {
  research: 'research',
  digest: 'digest',
  products: 'product',
  clauses: 'clause',
};

export function deriveId(collection: CollectionName, slug: string): string {
  return `${COLLECTION_PREFIX[collection]}-${slug}`;
}

// ── Content type mapping ──────────────────────────────────────────────────────

const COLLECTION_TYPE: Record<CollectionName, ContentType> = {
  research: 'research',
  digest: 'digest',
  products: 'product',
  clauses: 'clause',
};

// ── Publish status derivation ─────────────────────────────────────────────────

function derivePublishStatus(data: Record<string, unknown>): PublishStatus {
  if (data.publishStatus === 'archived') return 'archived';
  if (data.draft === true) return 'draft';
  return 'published';
}

// ── Array normalizer ──────────────────────────────────────────────────────────

function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((v) => typeof v === 'string');
  if (typeof val === 'string') return [val];
  return [];
}

// ── Relation normalizer ───────────────────────────────────────────────────────

function normalizeRelations(raw: unknown): RelationInput[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((r): r is RelationInput => {
    return (
      r !== null &&
      typeof r === 'object' &&
      typeof r.targetId === 'string' &&
      ALL_RELATION_TYPES.includes(r.type) &&
      ALL_CONFIDENCE_VALUES.includes(r.confidence) &&
      typeof r.explanation === 'string' &&
      r.explanation.trim().length > 0
    );
  });
}

// ── Main normalizer ───────────────────────────────────────────────────────────

export function normalizeEntry(entry: RawEntry): GraphNode {
  const { collection, slug, data } = entry;
  const contentType = COLLECTION_TYPE[collection];

  const id = typeof data.id === 'string' && data.id.trim()
    ? data.id.trim()
    : deriveId(collection, slug);

  const description = typeof data.description === 'string' && data.description.trim()
    ? data.description.trim()
    : typeof data.summary === 'string'
      ? data.summary.trim()
      : '';

  const crystallization: CrystallizationState =
    ['emergent', 'developing', 'crystallized'].includes(data.crystallization as string)
      ? (data.crystallization as CrystallizationState)
      : 'developing';

  const governanceRelevance: GovernanceRelevance =
    ['none', 'adjacent', 'direct'].includes(data.governanceRelevance as string)
      ? (data.governanceRelevance as GovernanceRelevance)
      : 'none';

  const publishedAt = data.publishedAt
    ? new Date(data.publishedAt as string | Date).toISOString()
    : undefined;

  const updatedAt = data.updatedAt
    ? new Date(data.updatedAt as string | Date).toISOString()
    : undefined;

  const node: GraphNode = {
    id,
    slug,
    title: typeof data.title === 'string' ? data.title : slug,
    description,
    contentType,
    status: derivePublishStatus(data),
    crystallization,
    governanceRelevance,
    domains: toStringArray(data.domains),
    themes: toStringArray(data.themes),
    tags: toStringArray(data.tags),
    lineage: toStringArray(data.lineage),
    sourceCollection: collection,
    publishedAt,
    updatedAt,
  };

  // Collection-specific fields
  if (collection === 'clauses') {
    if (data.governanceDomain) node.governanceDomain = String(data.governanceDomain);
    if (data.clauseStatus) node.clauseStatus = String(data.clauseStatus);
    if (typeof data.crystallizationThreshold === 'number') {
      node.crystallizationThreshold = data.crystallizationThreshold;
    }
    node.supportingContentIds = toStringArray(data.supportingContentIds);
    node.objections = toStringArray(data.objections);
  }

  if (collection === 'research') {
    node.unresolvedEdges = toStringArray(data.unresolvedEdges);
    node.keyClaims = toStringArray(data.keyClaims);
  }

  if (collection === 'products') {
    node.relatedResearch = toStringArray(data.relatedResearch);
    node.governanceNotes = toStringArray(data.governanceNotes);
  }

  return node;
}

export function normalizeAll(entries: RawEntry[]): {
  nodes: GraphNode[];
  explicitRelationsBySource: Map<string, ReturnType<typeof normalizeRelations>>;
} {
  const nodes: GraphNode[] = [];
  const explicitRelationsBySource = new Map<string, ReturnType<typeof normalizeRelations>>();

  for (const entry of entries) {
    const node = normalizeEntry(entry);
    nodes.push(node);
    const relations = normalizeRelations(entry.data.explicitRelations);
    if (relations.length > 0) {
      explicitRelationsBySource.set(node.id, relations);
    }
  }

  return { nodes, explicitRelationsBySource };
}
