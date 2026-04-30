/**
 * Lightweight relation inference from structural overlap.
 *
 * Inference is strictly secondary to manual relations.
 * Only uses safe inference types: clarifies, example_of, governance_relevant_to, remains_emergent_with.
 * High-consequence types such as contraindicates, depends_on, crystallizes, and extends require manual authorship.
 */
import type { GraphNode, GraphEdge } from './types';
import type { RelationType } from '../content/schemas/relations';
import { INFERABLE_RELATIONS } from '../content/schemas/relations';

function arrayOverlap(a: string[], b: string[]): string[] {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
}

function hasOverlap(a: string[], b: string[]): boolean {
  return arrayOverlap(a, b).length > 0;
}

function edgeExists(edges: GraphEdge[], source: string, target: string): boolean {
  return edges.some(
    (edge) => (edge.source === source && edge.target === target) ||
      (edge.source === target && edge.target === source),
  );
}

export function inferRelations(
  nodes: GraphNode[],
  existingEdges: GraphEdge[],
): GraphEdge[] {
  const inferred: GraphEdge[] = [];
  const published = nodes.filter((node) => node.status === 'published');

  for (let i = 0; i < published.length; i++) {
    for (let j = i + 1; j < published.length; j++) {
      const a = published[i];
      const b = published[j];

      if (edgeExists([...existingEdges, ...inferred], a.id, b.id)) continue;

      const sharedLineage = arrayOverlap(a.lineage, b.lineage);
      const sharedDomains = arrayOverlap(a.domains, b.domains);
      const sharedThemes = arrayOverlap(a.themes, b.themes);

      if (
        a.contentType === 'clause' &&
        b.governanceRelevance === 'direct' &&
        hasOverlap(a.domains, b.domains)
      ) {
        inferred.push(makeInferredEdge(
          b.id,
          a.id,
          'governance_relevant_to',
          `Both operate in domains [${sharedDomains.join(', ')}] and the content has direct governance relevance.`,
        ));
        continue;
      }

      if (
        b.contentType === 'clause' &&
        a.governanceRelevance === 'direct' &&
        hasOverlap(b.domains, a.domains)
      ) {
        inferred.push(makeInferredEdge(
          a.id,
          b.id,
          'governance_relevant_to',
          `Both operate in domains [${sharedDomains.join(', ')}] and the content has direct governance relevance.`,
        ));
        continue;
      }

      if (
        a.crystallization === 'emergent' &&
        b.crystallization === 'emergent' &&
        a.contentType !== b.contentType &&
        (sharedLineage.length > 0 || sharedThemes.length > 0)
      ) {
        const overlap = [...sharedLineage, ...sharedThemes].slice(0, 3);
        inferred.push(makeInferredEdge(
          a.id,
          b.id,
          'remains_emergent_with',
          `Both are emergent and share [${overlap.join(', ')}]. Open edges may be related.`,
        ));
        continue;
      }

      if (
        a.contentType === 'digest' &&
        b.contentType === 'research' &&
        sharedLineage.length > 0 &&
        sharedDomains.length > 0
      ) {
        inferred.push(makeInferredEdge(
          a.id,
          b.id,
          'clarifies',
          `Digest entry shares lineage [${sharedLineage.join(', ')}] and domain [${sharedDomains.join(', ')}] with this research entry.`,
        ));
        continue;
      }

      if (
        b.contentType === 'digest' &&
        a.contentType === 'research' &&
        sharedLineage.length > 0 &&
        sharedDomains.length > 0
      ) {
        inferred.push(makeInferredEdge(
          b.id,
          a.id,
          'clarifies',
          `Digest entry shares lineage [${sharedLineage.join(', ')}] and domain [${sharedDomains.join(', ')}] with this research entry.`,
        ));
        continue;
      }

      if (
        a.contentType === 'field' &&
        ['research', 'digest', 'product', 'clause'].includes(b.contentType) &&
        (sharedDomains.length > 0 || sharedLineage.length > 0 || sharedThemes.length > 0)
      ) {
        const overlap = [...sharedDomains, ...sharedLineage, ...sharedThemes].slice(0, 3);
        inferred.push(makeInferredEdge(
          a.id,
          b.id,
          'clarifies',
          `Field signal shares [${overlap.join(', ')}] with this node and acts as a nearby specimen or synthesis trace.`,
        ));
        continue;
      }

      if (
        b.contentType === 'field' &&
        ['research', 'digest', 'product', 'clause'].includes(a.contentType) &&
        (sharedDomains.length > 0 || sharedLineage.length > 0 || sharedThemes.length > 0)
      ) {
        const overlap = [...sharedDomains, ...sharedLineage, ...sharedThemes].slice(0, 3);
        inferred.push(makeInferredEdge(
          b.id,
          a.id,
          'clarifies',
          `Field signal shares [${overlap.join(', ')}] with this node and acts as a nearby specimen or synthesis trace.`,
        ));
        continue;
      }

      if (
        a.contentType === 'product' &&
        b.contentType === 'research' &&
        sharedLineage.length > 0
      ) {
        inferred.push(makeInferredEdge(
          a.id,
          b.id,
          'example_of',
          `Product shares lineage [${sharedLineage.join(', ')}] with this research and likely acts as an applied instantiation.`,
        ));
        continue;
      }

      if (
        b.contentType === 'product' &&
        a.contentType === 'research' &&
        sharedLineage.length > 0
      ) {
        inferred.push(makeInferredEdge(
          b.id,
          a.id,
          'example_of',
          `Product shares lineage [${sharedLineage.join(', ')}] with this research and likely acts as an applied instantiation.`,
        ));
      }
    }
  }

  return inferred;
}

function makeInferredEdge(
  source: string,
  target: string,
  type: RelationType,
  explanation: string,
): GraphEdge {
  const safeType: RelationType = INFERABLE_RELATIONS.includes(type) ? type : 'clarifies';

  return {
    source,
    target,
    type: safeType,
    confidence: 'low',
    explanation,
    provenance: [],
    manual: false,
    inferred: true,
  };
}
