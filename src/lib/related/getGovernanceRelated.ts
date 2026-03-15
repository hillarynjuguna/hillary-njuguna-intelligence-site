/**
 * Returns governance-adjacent content for a given node.
 * Used on clause pages to show supporting research/digest,
 * and on research pages to show related clauses.
 */
import type { GraphNode, GraphEdge, GovernanceClauseEntry } from '../graph/types';
import { loadContentGraph, loadGovernanceIndex } from '../generated/loaders';

export interface GovernanceLink {
  node: GraphNode;
  clauseEntry?: GovernanceClauseEntry;
  role: 'supporting' | 'clause' | 'adjacent';
}

export async function getGovernanceRelated(contentId: string): Promise<GovernanceLink[]> {
  try {
    const [graph, govIndex] = await Promise.all([
      loadContentGraph(),
      loadGovernanceIndex(),
    ]);

    const { nodes, edges } = graph;
    const result: GovernanceLink[] = [];
    const seen = new Set<string>();

    const node = nodes.find((n) => n.id === contentId);
    if (!node) return [];

    // If this is a clause: show its supporting content
    if (node.contentType === 'clause') {
      const clauseEntry = govIndex.clauses.find((c) => c.id === contentId);
      for (const supportId of clauseEntry?.supportingContentIds ?? []) {
        const supportNode = nodes.find((n) => n.id === supportId);
        if (supportNode && !seen.has(supportNode.id)) {
          result.push({ node: supportNode, role: 'supporting' });
          seen.add(supportNode.id);
        }
      }
    }

    // For any node: find directly connected clauses
    const connectedClauses = edges
      .filter((e) => {
        return (e.source === contentId || e.target === contentId) &&
               (nodes.find((n) => n.id === (e.source === contentId ? e.target : e.source))?.contentType === 'clause');
      })
      .map((e) => e.source === contentId ? e.target : e.source);

    for (const clauseId of connectedClauses) {
      if (seen.has(clauseId)) continue;
      const clauseNode = nodes.find((n) => n.id === clauseId);
      const clauseEntry = govIndex.clauses.find((c) => c.id === clauseId);
      if (clauseNode) {
        result.push({ node: clauseNode, clauseEntry, role: 'clause' });
        seen.add(clauseId);
      }
    }

    return result;
  } catch {
    return [];
  }
}
