import type { GraphNode, GraphEdge } from './types';

/** Returns all nodes reachable from a starting node following lineage or edge connections */
export function getLineageFamily(
  nodeId: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
): GraphNode[] {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return [];

  const related = new Set<string>();

  // Shared lineage
  if (node.lineage.length > 0) {
    for (const n of nodes) {
      if (n.id === nodeId) continue;
      if (n.lineage.some((l) => node.lineage.includes(l))) {
        related.add(n.id);
      }
    }
  }

  // Direct edges
  for (const edge of edges) {
    if (edge.source === nodeId) related.add(edge.target);
    if (edge.target === nodeId) related.add(edge.source);
  }

  return nodes.filter((n) => related.has(n.id));
}

/** Returns the lineage breadcrumb trail for a node */
export function getLineageTrail(
  node: GraphNode,
  allNodes: GraphNode[],
): Array<{ id: string; title: string; lineageLabel: string }> {
  if (node.lineage.length === 0) return [];

  const result: Array<{ id: string; title: string; lineageLabel: string }> = [];

  for (const lineageLabel of node.lineage) {
    // Find the most foundational research node with this lineage
    const anchor = allNodes.find(
      (n) => n.lineage.includes(lineageLabel) && n.contentType === 'research' && n.id !== node.id
    );
    if (anchor) {
      result.push({ id: anchor.id, title: anchor.title, lineageLabel });
    }
  }

  return result;
}
