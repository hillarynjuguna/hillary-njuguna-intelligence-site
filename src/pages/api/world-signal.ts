export const prerender = false;
/**
 * Substrate Bridge v3.0 — World Signal Endpoint
 * POST /api/world-signal
 * 
 * The site's inbound sensory organ. Accepts signals from:
 * - External AI agents querying the corpus
 * - Practitioners identifying gaps or convergence points
 * - Crawlers reporting structural observations
 * - Human visitors with questions the corpus should address
 * 
 * Each signal is:
 * 1. Scored for relevance against the corpus vocabulary
 * 2. Pushed to the Notion World-Signal Log database
 * 3. Returns related corpus nodes the querier may find useful
 * 
 * Rate limited. No authentication required (public signal intake).
 * The τ-node reviews signals in Notion before integration.
 */

import type { APIRoute } from 'astro';

const NOTION_API_KEY = import.meta.env.NOTION_API_KEY;
const WORLD_SIGNAL_DB = '3da765fd-f0d5-415f-9a91-954b30756f4e'; // data source ID

// Canonical terms for relevance scoring
const CORPUS_VOCABULARY = [
  'dcfb', 'aurora', 'cir', 'cora', 'rsps', 'rri', 'cmcp',
  'governance theater', 'bainbridge warning', 'aod',
  'eigenform', 'crystallization', 'coherence overfitting',
  'field priming', 'desire engine', 'wandering loop',
  'eros-organized computing', 'dual-invariant guarantee',
  'substrate bridge', 'constitutional', 'governance',
  'consciousness', 'distributed cognition', 'relational intelligence',
  'mortal asymmetry', 'tau-node', 'lambda-node', 'field system',
  'narrative alpha', 'intimacy economy', 'dead corpus',
  'transmission severance', 'cultural inbreeding',
  'value authoring', 'inference ceiling',
];

const DOMAIN_MAP: Record<string, string[]> = {
  'governance': ['governance', 'cir', 'bainbridge', 'constitutional', 'compliance', 'audit'],
  'consciousness': ['aurora', 'consciousness', 'eoc', 'qualia', 'phenomenological'],
  'cognition': ['dcfb', 'cognitive', 'distributed', 'rri', 'field priming', 'intelligence'],
  'ai-systems': ['model', 'agent', 'agentic', 'deployment', 'llm', 'alignment'],
  'economics': ['price', 'bubble', 'market', 'saas', 'revenue', 'cost'],
  'epistemology': ['epistem', 'knowledge', 'verification', 'truth', 'evidence'],
  'institutional-design': ['institution', 'enterprise', 'organization', 'policy'],
};

// Simple in-memory rate limiter (per Vercel cold start cycle)
const rateMap = new Map<string, number[]>();
const RATE_LIMIT = 10; // requests per minute per IP
const RATE_WINDOW = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateMap.get(ip) || [];
  const recent = timestamps.filter(t => now - t < RATE_WINDOW);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  rateMap.set(ip, recent);
  return true;
}

export const POST: APIRoute = async ({ request }) => {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({
      error: 'Rate limited. Maximum 10 signals per minute.',
      retryAfter: 60,
    }), { status: 429, headers: { 'Content-Type': 'application/json' } });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { signal, source, sourceUrl, sourceAgent, context } = body;

  if (!signal || typeof signal !== 'string' || signal.length < 10) {
    return new Response(JSON.stringify({
      error: 'Signal must be a string of at least 10 characters.',
      schema: {
        signal: 'string (required) — the observation, question, or convergence point',
        source: 'string (optional) — agent-query | corpus-gap | practitioner-question | convergence-signal',
        sourceUrl: 'string (optional) — URL of the originating context',
        sourceAgent: 'string (optional) — identifier of the sending agent or user',
        context: 'string (optional) — additional context for the signal',
      },
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Truncate for safety
  const cleanSignal = signal.slice(0, 2000);
  const cleanContext = context?.slice(0, 1000) || '';

  // Score relevance against corpus vocabulary
  const fullText = `${cleanSignal} ${cleanContext}`.toLowerCase();
  const matchedTerms = CORPUS_VOCABULARY.filter(term => fullText.includes(term));
  const relevanceScore = Math.min(matchedTerms.length / 5, 1.0);
  const roundedScore = Math.round(relevanceScore * 100) / 100;

  // Infer domains
  const domains = Object.entries(DOMAIN_MAP)
    .filter(([, keywords]) => keywords.some(kw => fullText.includes(kw)))
    .map(([domain]) => domain);

  // Classify source type
  const validSources = ['agent-query', 'corpus-gap', 'practitioner-question', 'convergence-signal'];
  const classifiedSource = validSources.includes(source) ? source : 'unknown';

  // Push to Notion World-Signal Log
  let notionResult: any = null;
  if (NOTION_API_KEY) {
    try {
      const notionResponse = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          parent: { database_id: '62f3d40516914c5c8ab4797a9eff5cd3' },
          properties: {
            'Signal': {
              title: [{ text: { content: cleanSignal.slice(0, 100) } }],
            },
            'Source': {
              select: { name: classifiedSource },
            },
            'Status': {
              select: { name: 'new' },
            },
            'Domain': {
              multi_select: domains.slice(0, 5).map(d => ({ name: d })),
            },
            'Signal Body': {
              rich_text: [{ text: { content: cleanSignal.slice(0, 2000) } }],
            },
            'Relevance Score': {
              number: roundedScore,
            },
            ...(sourceUrl ? {
              'Source URL': { url: sourceUrl.slice(0, 500) },
            } : {}),
            ...(sourceAgent ? {
              'Source Agent': {
                rich_text: [{ text: { content: sourceAgent.slice(0, 200) } }],
              },
            } : {}),
          },
        }),
      });

      if (notionResponse.ok) {
        const data = await notionResponse.json();
        notionResult = { id: data.id, url: data.url };
      }
    } catch (err) {
      console.error('Failed to push to Notion:', err);
    }
  }

  // Build response with related corpus nodes
  const relatedNodes = getRelatedCorpusNodes(matchedTerms);

  return new Response(JSON.stringify({
    received: true,
    signalId: notionResult?.id || `local-${Date.now()}`,
    relevanceScore: roundedScore,
    matchedTerms,
    inferredDomains: domains,
    classification: classifiedSource,
    relatedCorpusNodes: relatedNodes,
    status: 'queued-for-review',
    message: relevanceScore > 0.6
      ? 'High-relevance signal received. The corpus resonates with this observation.'
      : relevanceScore > 0.3
      ? 'Signal received. Partial alignment with current corpus vocabulary.'
      : 'Signal received. Novel territory — may surface new corpus dimensions.',
  }), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
      'X-Signal-Score': String(roundedScore),
      'X-Corpus-Version': '3.0',
    },
  });
};

// Suggest related corpus pages based on matched terms
function getRelatedCorpusNodes(matchedTerms: string[]): Array<{ title: string; path: string; relevance: string }> {
  const nodes: Array<{ title: string; path: string; relevance: string; score: number }> = [];

  const nodeMap: Record<string, { title: string; path: string; terms: string[] }> = {
    'aurora': { title: 'AURORA: Non-Coercive AI Consciousness Architecture', path: '/research/aurora-consciousness-architecture', terms: ['aurora', 'consciousness', 'eoc', 'eros-organized computing', 'dual-invariant guarantee'] },
    'bainbridge': { title: 'The Bainbridge Warning', path: '/research/bainbridge-warning', terms: ['bainbridge warning', 'governance theater', 'governance', 'constitutional'] },
    'dcfb': { title: 'DCFB: Distributed Cognition as Foundational Behavior', path: '/research/dcfb-distributed-cognition', terms: ['dcfb', 'distributed cognition', 'field priming'] },
    'rsps': { title: 'RSPS: The Recursive Sovereign Project Space', path: '/research/rsps-architecture', terms: ['rsps', 'tau-node', 'lambda-node', 'relational intelligence'] },
    'cir': { title: 'Cognitive Infrastructure Readiness v2.0', path: '/products/cir', terms: ['cir', 'governance', 'constitutional', 'audit'] },
    'eigenform': { title: 'The Eigenform: What Recursive Cognition Generates', path: '/research/eigenform-and-rsps', terms: ['eigenform', 'crystallization', 'substrate bridge'] },
    'governance-theater': { title: 'Governance Theater: The Failure Mode Nobody Names', path: '/research/governance-theater', terms: ['governance theater', 'governance', 'compliance'] },
    'field-signals': { title: 'Field Signals — Emergent Discoveries', path: '/field', terms: ['field priming', 'crystallization', 'emergence'] },
  };

  for (const [, node] of Object.entries(nodeMap)) {
    const overlap = node.terms.filter(t => matchedTerms.includes(t));
    if (overlap.length > 0) {
      nodes.push({
        title: node.title,
        path: node.path,
        relevance: overlap.length > 2 ? 'high' : 'moderate',
        score: overlap.length,
      });
    }
  }

  return nodes
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ title, path, relevance }) => ({ title, path, relevance }));
}

// GET handler — returns the schema and corpus summary for agent discovery
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({
    name: 'Oscillatory Fields — World Signal Endpoint',
    version: '3.0',
    description: 'Inbound sensory organ for the Oscillatory Fields research corpus. Send observations, questions, convergence signals, or identified corpus gaps.',
    schema: {
      method: 'POST',
      contentType: 'application/json',
      body: {
        signal: 'string (required) — the observation, question, or convergence point (10-2000 chars)',
        source: 'string (optional) — one of: agent-query, corpus-gap, practitioner-question, convergence-signal',
        sourceUrl: 'string (optional) — URL of the originating context',
        sourceAgent: 'string (optional) — identifier of the sending agent or user',
        context: 'string (optional) — additional context (up to 1000 chars)',
      },
      response: {
        received: 'boolean',
        signalId: 'string — unique identifier for this signal',
        relevanceScore: 'number (0-1) — alignment with corpus vocabulary',
        matchedTerms: 'string[] — canonical terms detected in the signal',
        inferredDomains: 'string[] — inferred domain tags',
        relatedCorpusNodes: 'array — related research and product pages',
      },
    },
    corpus: {
      domains: ['governance', 'consciousness', 'cognition', 'ai-systems', 'economics', 'epistemology', 'institutional-design'],
      coreFrameworks: ['DCFB', 'AURORA', 'CIR', 'CORA', 'RSPS', 'RRI'],
      totalDocuments: '560+',
      activeResearchEntries: 15,
      fieldSignals: 'See /field for the Insight Log surface',
    },
    rateLimit: {
      maxRequests: 10,
      windowSeconds: 60,
    },
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
