/**
 * Returns human-readable relation reasons for a specific edge.
 */
import type { GraphEdge, GraphNode } from '../graph/types';
import { getEdgeLabel, getEdgeExplanation, getConfidenceNote } from '../graph/explain';

export interface RelationReason {
  label: string;
  explanation: string;
  confidenceNote: string;
  isManual: boolean;
}

export function getRelationReason(
  edge: GraphEdge,
  sourceNode?: GraphNode,
  targetNode?: GraphNode,
): RelationReason {
  return {
    label: getEdgeLabel(edge),
    explanation: getEdgeExplanation(edge, sourceNode, targetNode),
    confidenceNote: getConfidenceNote(edge),
    isManual: edge.manual,
  };
}
