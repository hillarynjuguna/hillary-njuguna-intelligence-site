/**
 * Get ranked related content for a given content ID.
 * Reads from the pre-built content graph artifact.
 */
import type { RelatedItem } from '../graph/types';
import { rankRelatedItems } from '../graph/relationRanker';
import { loadContentGraph } from '../generated/loaders';

export async function getRelatedContent(
  contentId: string,
  limit = 4,
): Promise<RelatedItem[]> {
  const graph = await loadContentGraph();
  const sourceNode = graph.nodes.find((node) => node.id === contentId);

  if (!sourceNode) {
    throw new Error(`Graph context missing for "${contentId}". Regenerate artifacts before rendering related content.`);
  }

  return rankRelatedItems(sourceNode.id, graph.nodes, graph.edges, limit);
}
