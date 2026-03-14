import type { GraphNode, TaxonomyIndex, TaxonomyGroup } from './types';

export function buildTaxonomyIndex(nodes: GraphNode[]): TaxonomyIndex {
  const domains: Record<string, TaxonomyGroup> = {};
  const themes: Record<string, TaxonomyGroup> = {};
  const tags: Record<string, TaxonomyGroup> = {};
  const lineage: Record<string, TaxonomyGroup> = {};

  function addToGroup(
    map: Record<string, TaxonomyGroup>,
    key: string,
    nodeId: string,
  ) {
    if (!map[key]) {
      map[key] = { label: key, contentIds: [], count: 0 };
    }
    if (!map[key].contentIds.includes(nodeId)) {
      map[key].contentIds.push(nodeId);
      map[key].count++;
    }
  }

  for (const node of nodes) {
    if (node.status !== 'published') continue;
    for (const d of node.domains) addToGroup(domains, d, node.id);
    for (const t of node.themes) addToGroup(themes, t, node.id);
    for (const tag of node.tags) addToGroup(tags, tag, node.id);
    for (const l of node.lineage) addToGroup(lineage, l, node.id);
  }

  return { domains, themes, tags, lineage, generatedAt: new Date().toISOString() };
}
