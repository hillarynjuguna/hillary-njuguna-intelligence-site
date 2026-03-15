/**
 * Get ranked related content for a given content ID.
 * Reads from the pre-built content graph artifact.
 * Falls back to empty array if artifact not available.
 */
import type { RelatedItem } from '../graph/types';
import { rankRelatedItems } from '../graph/relationRanker';
import { loadContentGraph } from '../generated/loaders';

export async function getRelatedContent(
  contentId: string,
  limit = 4,
): Promise<RelatedItem[]> {
  try {
    const graph = await loadContentGraph();
    return rankRelatedItems(contentId, graph.nodes, graph.edges, limit);
  } catch {
    // Graph not yet generated or unavailable — return empty
    return [];
  }
}
