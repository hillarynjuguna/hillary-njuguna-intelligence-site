/**
 * Human-readable explanation generators for graph edges.
 */
import type { GraphEdge, GraphNode } from './types';
import { RELATION_LABELS } from '../content/schemas/relations';

export function getEdgeLabel(edge: GraphEdge): string {
  return RELATION_LABELS[edge.type] ?? edge.type;
}

export function getEdgeExplanation(
  edge: GraphEdge,
  sourceNode?: GraphNode,
  targetNode?: GraphNode,
): string {
  // Prefer authored explanation
  if (edge.explanation && edge.explanation.trim().length > 0) {
    return edge.explanation;
  }

  // Fallback template
  const sourceTitle = sourceNode?.title ?? edge.source;
  const targetTitle = targetNode?.title ?? edge.target;
  const label = getEdgeLabel(edge).toLowerCase();

  return `"${sourceTitle}" ${label} "${targetTitle}".`;
}

export function getConfidenceNote(edge: GraphEdge): string {
  if (edge.manual) return '';
  if (edge.confidence === 'low') return 'Inferred from structural overlap — verify manually.';
  if (edge.confidence === 'medium') return 'Inferred with moderate confidence.';
  return '';
}
