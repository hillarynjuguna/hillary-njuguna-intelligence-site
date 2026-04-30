export const prerender = true;
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { loadContentGraph } from '@lib/generated/loaders';
import { countNodeNeighbors, findGraphNode, getNeighborLabel, getFieldTypeMeta } from '@lib/field';

function requireGraphNode(
  graph: Awaited<ReturnType<typeof loadContentGraph>>,
  options: { id?: string; slug?: string; sourceCollection?: string },
  label: string,
) {
  const node = findGraphNode(graph, options);
  if (!node) {
    throw new Error(`search.json: missing graph node for ${label}`);
  }

  return node;
}

export const GET: APIRoute = async () => {
  const [digest, research, products, clauses, fieldSignals, graph] = await Promise.all([
    getCollection('digest', ({ data }) => !data.draft),
    getCollection('research', ({ data }) => !data.draft),
    getCollection('products', ({ data }) => !data.draft),
    getCollection('clauses', ({ data }) => data.publishStatus !== 'draft'),
    getCollection('field-signals', ({ data }) => !data.draft),
    loadContentGraph(),
  ]);

  const index = [
    ...digest.map((entry) => {
      const node = requireGraphNode(graph, { id: entry.data.id, slug: entry.slug, sourceCollection: 'digest' }, `digest/${entry.slug}`);
      const neighborCount = countNodeNeighbors(graph, node.id);
      return {
        id: entry.data.id ?? `digest-${entry.slug}`,
        type: 'digest',
        typeLabel: getFieldTypeMeta('digest').label,
        title: entry.data.title,
        summary: entry.data.summary,
        excerpt: entry.data.excerpt ?? entry.data.summary.slice(0, 160),
        tags: entry.data.tags,
        domains: entry.data.domains,
        lineage: entry.data.lineage,
        category: entry.data.category,
        neighborCount,
        neighborLabel: getNeighborLabel(neighborCount, 'Field note'),
        pathHint: 'Open note',
        publishedAt: entry.data.publishedAt.toISOString(),
        url: `/digest/${entry.slug}`,
      };
    }),
    ...research.map((entry) => {
      const node = requireGraphNode(graph, { id: entry.data.id, slug: entry.slug, sourceCollection: 'research' }, `research/${entry.slug}`);
      const neighborCount = countNodeNeighbors(graph, node.id);
      return {
        id: entry.data.id ?? `research-${entry.slug}`,
        type: 'research',
        typeLabel: getFieldTypeMeta('research').label,
        title: entry.data.title,
        summary: entry.data.summary,
        excerpt: entry.data.excerpt ?? entry.data.summary.slice(0, 160),
        tags: entry.data.tags,
        domains: entry.data.domains,
        lineage: entry.data.lineage,
        themes: entry.data.themes,
        concepts: entry.data.concepts,
        neighborCount,
        neighborLabel: getNeighborLabel(neighborCount, 'Research node'),
        pathHint: 'Read node',
        publishedAt: entry.data.publishedAt.toISOString(),
        url: `/research/${entry.slug}`,
      };
    }),
    ...products.map((entry) => {
      const node = requireGraphNode(graph, { id: entry.data.id, slug: entry.slug, sourceCollection: 'products' }, `products/${entry.slug}`);
      const neighborCount = countNodeNeighbors(graph, node.id);
      return {
        id: entry.data.id ?? `product-${entry.slug}`,
        type: 'products',
        typeLabel: getFieldTypeMeta('products').label,
        title: entry.data.title,
        summary: entry.data.summary,
        excerpt: entry.data.excerpt ?? entry.data.summary.slice(0, 160),
        tags: entry.data.tags,
        domains: entry.data.domains,
        lineage: entry.data.lineage,
        status: entry.data.status,
        productType: entry.data.productType,
        neighborCount,
        neighborLabel: getNeighborLabel(neighborCount, 'Applied node'),
        pathHint: 'Open node',
        url: `/products/${entry.slug}`,
      };
    }),
    ...clauses.map((entry) => {
      const node = requireGraphNode(graph, { id: entry.data.id, slug: entry.slug, sourceCollection: 'clauses' }, `clauses/${entry.slug}`);
      const neighborCount = countNodeNeighbors(graph, node.id);
      return {
        id: entry.data.id ?? `clause-${entry.slug}`,
        type: 'clauses',
        typeLabel: getFieldTypeMeta('clauses').label,
        title: entry.data.title,
        summary: entry.data.notes ?? entry.data.clauseText ?? '',
        excerpt: entry.data.notes?.slice(0, 160) ?? entry.data.clauseText?.slice(0, 160) ?? '',
        tags: entry.data.tags,
        domains: entry.data.governanceDomain ? [entry.data.governanceDomain] : [],
        lineage: entry.data.lineage,
        status: entry.data.clauseStatus,
        neighborCount,
        neighborLabel: getNeighborLabel(neighborCount, 'Emergent clause'),
        pathHint: 'Open clause',
        url: `/clauses/${entry.slug}`,
      };
    }),
    ...fieldSignals.map((entry) => {
      const node = requireGraphNode(graph, { id: entry.data.id, slug: entry.slug, sourceCollection: 'field-signals' }, `field/${entry.slug}`);
      const neighborCount = countNodeNeighbors(graph, node.id);
      return {
        id: entry.data.id ?? `field-signal-${entry.slug}`,
        type: 'field',
        typeLabel: getFieldTypeMeta('field').label,
        title: entry.data.title,
        summary: entry.data.summary,
        excerpt: entry.data.summary.slice(0, 160),
        tags: node.tags,
        domains: entry.data.domains,
        lineage: entry.data.lineage,
        status: entry.data.signalType,
        neighborCount,
        neighborLabel: getNeighborLabel(neighborCount, 'Field signal'),
        pathHint: 'Trace signal',
        publishedAt: entry.data.publishedAt.toISOString(),
        url: `/field/${entry.slug}`,
      };
    }),
  ];

  return new Response(JSON.stringify({ index, generated: graph.generatedAt }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
