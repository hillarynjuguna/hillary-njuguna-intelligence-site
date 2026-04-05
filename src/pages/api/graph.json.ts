export const prerender = false;
/**
 * Substrate Bridge v3.0 — Knowledge Graph API
 * GET /api/graph.json
 * 
 * Exposes the site's content graph as a JSON-LD document
 * for external agents, crawlers, and λ-nodes.
 * 
 * This is the A2A interoperability layer — making the corpus
 * machine-readable without requiring human interpretation.
 * 
 * Endpoints:
 * - GET /api/graph.json — Full graph with nodes and edges
 * - GET /api/graph.json?node=research-aurora — Single node with edges
 * - GET /api/graph.json?domain=governance — Domain-filtered subgraph
 */

import type { APIRoute } from 'astro';
import graphData from '../../data/generated/content-graph.json';

const SITE_URL = 'https://hillary-site.vercel.app';

export const GET: APIRoute = async ({ url }) => {
  const nodeId = url.searchParams.get('node');
  const domain = url.searchParams.get('domain');
  const format = url.searchParams.get('format') || 'json-ld';

  const graph = graphData as { nodes: any[]; edges: any[] };

  // Single node query
  if (nodeId) {
    const node = graph.nodes.find((n: any) => n.id === nodeId);
    if (!node) {
      return new Response(JSON.stringify({ error: `Node "${nodeId}" not found` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const connectedEdges = graph.edges.filter(
      (e: any) => e.source === nodeId || e.target === nodeId
    );

    const connectedNodes = connectedEdges
      .map((e: any) => e.source === nodeId ? e.target : e.source)
      .map((id: string) => graph.nodes.find((n: any) => n.id === id))
      .filter(Boolean);

    return jsonLdResponse({
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: `Oscillatory Fields — ${node.title || nodeId}`,
      description: node.description || node.summary,
      url: `${SITE_URL}${nodePathFromId(nodeId)}`,
      mainEntity: formatNodeAsJsonLd(node),
      hasPart: connectedNodes.map((n: any) => formatNodeAsJsonLd(n)),
      associatedRelations: connectedEdges.map(formatEdgeAsJsonLd),
    });
  }

  // Domain-filtered query
  if (domain) {
    const domainNodes = graph.nodes.filter(
      (n: any) => n.domains?.includes(domain)
    );
    const nodeIds = new Set(domainNodes.map((n: any) => n.id));
    const domainEdges = graph.edges.filter(
      (e: any) => nodeIds.has(e.source) || nodeIds.has(e.target)
    );

    return jsonLdResponse({
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: `Oscillatory Fields — ${domain} domain`,
      description: `Subgraph of the Oscillatory Fields corpus filtered to the ${domain} domain.`,
      url: `${SITE_URL}/api/graph.json?domain=${domain}`,
      mainEntity: domainNodes.map((n: any) => formatNodeAsJsonLd(n)),
      size: `${domainNodes.length} nodes, ${domainEdges.length} edges`,
    });
  }

  // Full graph
  return jsonLdResponse({
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Oscillatory Fields — Knowledge Graph',
    description: 'The complete content graph of the Oscillatory Fields research corpus. Nodes represent research entries, digest notes, products, and governance clauses. Edges represent typed semantic relations.',
    url: `${SITE_URL}/api/graph.json`,
    creator: {
      '@type': 'Person',
      name: 'Hillary Njuguna',
      url: SITE_URL,
    },
    dateModified: new Date().toISOString(),
    license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    variableMeasured: [
      { '@type': 'PropertyValue', name: 'totalNodes', value: graph.nodes.length },
      { '@type': 'PropertyValue', name: 'totalEdges', value: graph.edges.length },
      { '@type': 'PropertyValue', name: 'manualEdges', value: graph.edges.filter((e: any) => e.manual).length },
      { '@type': 'PropertyValue', name: 'inferredEdges', value: graph.edges.filter((e: any) => !e.manual).length },
    ],
    mainEntity: graph.nodes.map((n: any) => formatNodeAsJsonLd(n)),
    // Include discovery endpoints
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: `${SITE_URL}/api/world-signal`,
        description: 'Send a signal to the corpus — observations, questions, or convergence points.',
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
  };

  return {
    '@type': typeMap[node.contentType] || 'CreativeWork',
    '@id': `${SITE_URL}${nodePathFromId(node.id)}`,
    name: node.title,
    description: node.description || node.summary,
    url: `${SITE_URL}${nodePathFromId(node.id)}`,
    about: (node.domains || []).map((d: string) => ({
      '@type': 'Thing',
      name: d,
    })),
    isPartOf: (node.lineage || []).map((l: string) => ({
      '@type': 'CreativeWork',
      name: l,
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

function nodePathFromId(id: string): string {
  if (id.startsWith('research-')) return `/research/${id.replace('research-', '')}`;
  if (id.startsWith('digest-')) return `/digest/${id.replace('digest-', '')}`;
  if (id.startsWith('product-')) return `/products/${id.replace('product-', '')}`;
  if (id.startsWith('clause-')) return `/clauses/${id.replace('clause-', '')}`;
  if (id.startsWith('field-signal-')) return `/field/signal-${id.replace('field-signal-', '')}`;
  return `/${id}`;
}

function jsonLdResponse(data: any): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/ld+json',
      'Cache-Control': 'public, max-age=3600, s-maxage=7200',
      'X-Corpus-Nodes': String(data.mainEntity?.length || 0),
      'X-Corpus-Version': '3.0',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  });
}
