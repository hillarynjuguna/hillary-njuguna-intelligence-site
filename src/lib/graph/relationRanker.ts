/**
 * Ranks related content using typed relation scoring.
 *
 * Priority order:
 * 1. Explicit manual typed relations (highest)
 * 2. Shared lineage
 * 3. Shared governance relevance
 * 4. Shared domains/themes
 * 5. Shared tags
 * 6. Recency as tie-breaker only
 */
import type { GraphNode, GraphEdge, RelatedItem } from './types';
import type { RelationType } from '../content/schemas/relations';
import { RELATION_LABELS } from '../content/schemas/relations';

// ── Scoring weights ───────────────────────────────────────────────────────────

const MANUAL_EDGE_BASE = 1000;
const INFERRED_EDGE_BASE = 200;

const CONFIDENCE_MULTIPLIER: Record<string, number> = {
  high: 1.0,
  medium: 0.7,
  low: 0.4,
};

const RELATION_TYPE_WEIGHT: Partial<Record<RelationType, number>> = {
  depends_on: 1.5,
  crystallizes: 1.4,
  derives_from: 1.3,
  extends: 1.3,
  prototype_for: 1.2,
  governance_relevant_to: 1.2,
  responds_to: 1.1,
  tensions_with: 1.1,
  clarifies: 1.0,
  example_of: 0.9,
  remains_emergent_with: 0.8,
  contraindicates: 0.7,
};

// ── Main ranker ───────────────────────────────────────────────────────────────

export function rankRelatedItems(
  sourceId: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
  limit = 4,
): RelatedItem[] {
  const sourceNode = nodes.find((n) => n.id === sourceId);
  if (!sourceNode) return [];

  const candidates = new Map<string, RelatedItem>();

  // ── Step 1: Score edges ───────────────────────────────────────────────────

  for (const edge of edges) {
    const isSource = edge.source === sourceId;
    const isTarget = edge.target === sourceId;
    if (!isSource && !isTarget) continue;

    const otherId = isSource ? edge.target : edge.source;
    const otherNode = nodes.find((n) => n.id === otherId);
    if (!otherNode || otherNode.status !== 'published') continue;

    const baseScore = edge.manual ? MANUAL_EDGE_BASE : INFERRED_EDGE_BASE;
    const confidenceMultiplier = CONFIDENCE_MULTIPLIER[edge.confidence] ?? 0.5;
    const typeWeight = RELATION_TYPE_WEIGHT[edge.type] ?? 1.0;
    const score = baseScore * confidenceMultiplier * typeWeight;

    const existing = candidates.get(otherId);
    if (!existing || score > existing.score) {
      candidates.set(otherId, {
        node: otherNode,
        edge,
        reason: edge.explanation,
        relationLabel: RELATION_LABELS[edge.type] ?? edge.type,
        score,
      });
    }
  }

  // ── Step 2: Structural overlap scoring ───────────────────────────────────

  const publishedOthers = nodes.filter(
    (n) => n.id !== sourceId && n.status === 'published' && !candidates.has(n.id)
  );

  for (const other of publishedOthers) {
    let score = 0;
    const reasons: string[] = [];

    // Shared lineage
    const sharedLineage = sourceNode.lineage.filter((l) => other.lineage.includes(l));
    if (sharedLineage.length > 0) {
      score += 80 * sharedLineage.length;
      reasons.push(`Shared lineage: ${sharedLineage.join(', ')}`);
    }

    // Shared governance relevance
    if (
      sourceNode.governanceRelevance !== 'none' &&
      other.governanceRelevance !== 'none'
    ) {
      score += 60;
      reasons.push('Both have governance relevance');
    }

    // Shared domains
    const sharedDomains = sourceNode.domains.filter((d) => other.domains.includes(d));
    if (sharedDomains.length > 0) {
      score += 40 * sharedDomains.length;
      reasons.push(`Shared domains: ${sharedDomains.join(', ')}`);
    }

    // Shared themes
    const sharedThemes = sourceNode.themes.filter((t) => other.themes.includes(t));
    if (sharedThemes.length > 0) {
      score += 25 * sharedThemes.length;
      reasons.push(`Shared themes: ${sharedThemes.join(', ')}`);
    }

    // Shared tags — weakest signal
    const sharedTags = sourceNode.tags.filter((t) => other.tags.includes(t));
    if (sharedTags.length > 0) {
      score += 10 * sharedTags.length;
    }

    // Recency tie-breaker (tiny boost for recent content)
    if (other.publishedAt) {
      const daysAgo = (Date.now() - new Date(other.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 5 - daysAgo * 0.01);
    }

    if (score > 0 && reasons.length > 0) {
      // Create a synthetic structural edge for display
      const syntheticEdge: GraphEdge = {
        source: sourceId,
        target: other.id,
        type: 'clarifies',
        confidence: 'low',
        explanation: reasons[0],
        provenance: [],
        manual: false,
        inferred: true,
      };
      candidates.set(other.id, {
        node: other,
        edge: syntheticEdge,
        reason: reasons.join(' · '),
        relationLabel: 'Related',
        score,
      });
    }
  }

  // ── Step 3: Sort by score, return top N ──────────────────────────────────

  return Array.from(candidates.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
