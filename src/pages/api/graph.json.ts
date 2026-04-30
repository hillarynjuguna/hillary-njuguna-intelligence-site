export const prerender = false;
/**
 * GET /api/graph.json
 *
 * Exposes the generated corpus graph as JSON-LD.
 * Supports full graph, single node, and domain-filtered views.
 */
import type { APIRoute } from 'astro';
import { loadContentGraph } from '@lib/generated/loaders';
import { getNodeHref } from '@lib/field';
import { SITE } from '@data/site';

const SITE_URL = SITE.url;

export const GET: APIRoute = async ({ url }) => {
  const nodeId = url.searchParams.get('node');
  const domain = url.searchParams.get('domain');
  const graph = await loadContentGraph();

  if (nodeId) {
    const node = graph.nodes.find((candidate) => candidate.id === nodeId);
    if (!node) {
      return new Response(JSON.stringify({ error: `Node "${nodeId}" not found` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const connectedEdges = graph.edges.filter(
      (edge) => edge.source === nodeId || edge.target === nodeId,
    );

    const connectedNodes = connectedEdges
      .map((edge) => (edge.source === nodeId ? edge.target : edge.source))
      .map((id) => graph.nodes.find((candidate) => candidate.id === id))
      .filter(Boolean);

    return jsonLdResponse({
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: `Oscillatory Fields: ${node.title || nodeId}`,
      description: node.description,
      url: `${SITE_URL}${nodePathFromNode(node)}`,
      mainEntity: formatNodeAsJsonLd(node),
      hasPart: connectedNodes.map((candidate) => formatNodeAsJsonLd(candidate)),
      associatedRelations: connectedEdges.map(formatEdgeAsJsonLd),
    });
  }

  if (domain) {
    const domainNodes = graph.nodes.filter((node) => node.domains?.includes(domain));
    const nodeIds = new Set(domainNodes.map((node) => node.id));
    const domainEdges = graph.edges.filter(
      (edge) => nodeIds.has(edge.source) || nodeIds.has(edge.target),
    );

    return jsonLdResponse({
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: `Oscillatory Fields: ${domain} domain`,
      description: `Subgraph of the Oscillatory Fields corpus filtered to the ${domain} domain.`,
      url: `${SITE_URL}/api/graph.json?domain=${domain}`,
      mainEntity: domainNodes.map((node) => formatNodeAsJsonLd(node)),
      size: `${domainNodes.length} nodes, ${domainEdges.length} edges`,
      dateModified: graph.generatedAt,
    });
  }

  return jsonLdResponse({
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Oscillatory Fields Knowledge Graph',
    description: 'The complete content graph of the Oscillatory Fields research corpus.',
    url: `${SITE_URL}/api/graph.json`,
    creator: {
      '@type': 'Person',
      name: 'Hillary Njuguna',
      url: SITE_URL,
    },
    dateModified: graph.generatedAt,
    license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    variableMeasured: [
      { '@type': 'PropertyValue', name: 'totalNodes', value: graph.nodes.length },
      { '@type': 'PropertyValue', name: 'totalEdges', value: graph.edges.length },
      { '@type': 'PropertyValue', name: 'manualEdges', value: graph.edges.filter((edge) => edge.manual).length },
      { '@type': 'PropertyValue', name: 'inferredEdges', value: graph.edges.filter((edge) => !edge.manual).length },
    ],
    mainEntity: graph.nodes.map((node) => formatNodeAsJsonLd(node)),
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: `${SITE_URL}/api/world-signal`,
        description: 'Send a signal to the corpus: observations, questions, or convergence points.',
        'query-input': 'required name=signal',
      },
      {
        '@type': 'SearchAction',
        target: `${SITE_URL}/api/graph.json?node={nodeId}`,
        description: 'Query a specific node in the knowledge graph.',
        'query-input': 'required name=nodeId',
      },
    ],
  });
};

function formatNodeAsJsonLd(node: any) {
  const typeMap: Record<string, string> = {
    research: 'ScholarlyArticle',
    digest: 'Article',
    product: 'SoftwareApplication',
    clause: 'Legislation',
    field: 'CreativeWork',
  };

  return {
    '@type': typeMap[node.contentType] || 'CreativeWork',
    '@id': `${SITE_URL}${nodePathFromNode(node)}`,
    name: node.title,
    description: node.description,
    url: `${SITE_URL}${nodePathFromNode(node)}`,
    about: (node.domains || []).map((domain: string) => ({
      '@type': 'Thing',
      name: domain,
    })),
    isPartOf: (node.lineage || []).map((lineage: string) => ({
      '@type': 'CreativeWork',
      name: lineage,
    })),
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'crystallization', value: node.crystallization },
      { '@type': 'PropertyValue', name: 'governanceRelevance', value: node.governanceRelevance },
    ],
  };
}

function formatEdgeAsJsonLd(edge: any) {
  return {
    '@type': 'PropertyValue',
    name: edge.type,
    value: {
      source: edge.source,
      target: edge.target,
      confidence: edge.confidence || 'inferred',
      manual: edge.manual || false,
    },
  };
}

function nodePathFromNode(node: any): string {
  if (node?.slug && (node?.sourceCollection || node?.contentType)) {
    return getNodeHref(node);
  }

  return `/${node?.id ?? ''}`;
}

function jsonLdResponse(data: any): Response {
  const mainEntityCount = Array.isArray(data.mainEntity) ? data.mainEntity.length : data.mainEntity ? 1 : 0;

  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/ld+json',
      'Cache-Control': 'public, max-age=3600, s-maxage=7200',
      'X-Corpus-Nodes': String(mainEntityCount),
      'X-Corpus-Version': '3.0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  });
}
