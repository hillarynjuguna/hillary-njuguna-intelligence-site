import type { GraphNode, GraphEdge, GovernanceIndex, GovernanceClauseEntry, GovernanceAdjacency } from './types';

export function buildGovernanceIndex(
  nodes: GraphNode[],
  edges: GraphEdge[],
): GovernanceIndex {
  const clauses = nodes.filter((n) => n.contentType === 'clause' && n.status === 'published');
  const clauseIds = new Set(clauses.map((c) => c.id));

  // Clause entries
  const clauseEntries: GovernanceClauseEntry[] = clauses.map((c) => ({
    id: c.id,
    title: c.title,
    clauseStatus: c.clauseStatus ?? 'candidate',
    governanceDomain: c.governanceDomain ?? 'synthesis',
    crystallizationThreshold: c.crystallizationThreshold ?? 0.5,
    supportingContentIds: c.supportingContentIds ?? [],
    objections: c.objections ?? [],
    crystallization: c.crystallization,
  }));

  // Adjacency: non-clause nodes connected to at least one clause
  const adjacency: GovernanceAdjacency[] = [];
  const govNodes = nodes.filter(
    (n) => n.contentType !== 'clause' &&
           n.status === 'published' &&
           (n.governanceRelevance === 'direct' || n.governanceRelevance === 'adjacent')
  );

  for (const node of govNodes) {
    const linkedClauses = edges
      .filter((e) => {
        return (
          (e.source === node.id && clauseIds.has(e.target)) ||
          (e.target === node.id && clauseIds.has(e.source))
        );
      })
      .map((e) => (e.source === node.id ? e.target : e.source));

    adjacency.push({
      contentId: node.id,
      contentTitle: node.title,
      contentType: node.contentType,
      clauseIds: linkedClauses,
      governanceRelevance: node.governanceRelevance,
    });
  }

  // Domain groupings
  const byDomain: Record<string, string[]> = {};
  for (const clause of clauses) {
    const domain = clause.governanceDomain ?? 'synthesis';
    if (!byDomain[domain]) byDomain[domain] = [];
    byDomain[domain].push(clause.id);
  }

  return {
    clauses: clauseEntries,
    adjacency,
    byDomain,
    generatedAt: new Date().toISOString(),
  };
}
