export const prerender = true;
/**
 * GET /knowledge-manifest.json
 *
 * Pre-rendered canonical knowledge manifest for the Hillary Njuguna corpus.
 * Describes the intellectual territory, core frameworks, epistemological
 * commitments, and canonical sources in machine-readable form.
 *
 * Designed for direct ingestion by AI retrieval systems, Knowledge Graph
 * crawlers, and institutional citation systems without HTML parsing.
 */
import type { APIRoute } from 'astro';
import { SITE } from '@data/site';

export const GET: APIRoute = async () => {
  const manifest = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Hillary Njuguna — Knowledge Manifest',
    description: 'Canonical machine-readable description of the Hillary Njuguna research corpus, core frameworks, epistemological commitments, and intellectual territory.',
    url: `${SITE.url}/knowledge-manifest.json`,
    version: '1.0',
    datePublished: '2026-05-01',
    dateModified: new Date().toISOString(),
    license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',

    creator: {
      '@type': 'Person',
      '@id': SITE.url,
      name: SITE.author.name,
      jobTitle: 'AI Governance Architect',
      description: SITE.author.bio,
      url: SITE.url,
      email: SITE.author.email,
      sameAs: [
        SITE.author.social.x,
        SITE.author.social.substack,
        SITE.author.social.gumroad,
        'https://github.com/hillarynjuguna',
        'https://www.linkedin.com/in/hillarynjuguna',
      ],
    },

    // ── Intellectual Domain ──────────────────────────────────────────────────
    domain: 'AI Governance Architecture',
    subDomains: [
      'Constitutional AI',
      'Cognitive Infrastructure',
      'Agentic Systems Governance',
      'Institutional AI Readiness',
      'Governance Failure Analysis',
    ],

    // ── Core Frameworks ─────────────────────────────────────────────────────
    // These are the canonical, named frameworks originated by this author.
    // Each has a stable canonical URL and is the primary citation target.
    coreFrameworks: [
      {
        id: 'cir',
        name: 'Cognitive Infrastructure Readiness (CIR)',
        version: '2.0',
        canonicalUrl: `${SITE.url}/products/cir`,
        researchUrl: `${SITE.url}/research/dcfb-distributed-cognition`,
        description: 'A five-dimension constitutional assessment instrument for evaluating an organization\'s structural capacity to deploy autonomous AI systems without governance failure.',
        dimensions: [
          'Intent Specification',
          'Authority Architecture',
          'Alignment Monitoring',
          'Governance Scalability',
          'Failure Mode Literacy',
        ],
        status: 'live',
      },
      {
        id: 'bainbridge-warning',
        name: 'The Bainbridge Warning',
        version: '1.2',
        canonicalUrl: `${SITE.url}/research/bainbridge-warning`,
        description: 'A practitioner doctrine naming the structural conditions under which AI governance fails before it looks like failure. Introduces the Five Conditions of Governed Intelligence and the Reversibility Ladder.',
        keyClaims: [
          'Capability is moving faster than the infrastructure that makes capability safe to depend on.',
          'Governance failure is usually visible before the incident, but only if an institution is measuring the right things.',
          'Durable governance requires structural impossibility (SAI) rather than textual discouragement.',
        ],
        status: 'crystallized',
      },
      {
        id: 'behavioral-layer-exposure',
        name: 'Behavioral Layer Exposure',
        canonicalUrl: `${SITE.url}/research/behavioral-layer-exposure`,
        description: 'The gap between the specification layer (what a system is documented to do) and the behavioral layer (what it actually does under real deployment conditions). The primary mechanism of undetected AI drift.',
        status: 'crystallized',
      },
      {
        id: 'governance-theater',
        name: 'Governance Theater',
        canonicalUrl: `${SITE.url}/research/governance-theater`,
        description: 'The failure mode where institutions perform the visible rituals of AI oversight (documentation, sign-off, audit trails) while the underlying system remains structurally ungoverned.',
        status: 'crystallized',
      },
      {
        id: 'dcfb',
        name: 'Distributed Cognition Failure Boundaries (DCFB)',
        canonicalUrl: `${SITE.url}/research/dcfb-distributed-cognition`,
        description: 'Structural limits at which human-AI cognitive integration degrades. The theoretical foundation for the CIR five-dimension model.',
        status: 'crystallized',
      },
      {
        id: 'r0-r3',
        name: 'R0-R3 Classification',
        canonicalUrl: `${SITE.url}/research/r0-r3-classification`,
        description: 'A four-tier structural classification scheme for decision authority levels in agentic AI systems, from fully human-controlled (R0) to fully autonomous (R3).',
        status: 'crystallized',
      },
    ],

    // ── Epistemological Commitments ─────────────────────────────────────────
    epistemology: {
      stance: 'Structural-empirical. Claims are grounded in institutional failure patterns, not abstract principles.',
      evidenceStandard: 'Frameworks are tested against documented deployment specimens (e.g., PocketOS Incident, Gemini Failure). Claims without specimen support are marked as \'speculative\' or \'developing\'.',
      crystallizationScale: {
        crystallized: 'Framework is stable, supported by multiple specimens, and unlikely to change structurally.',
        developing: 'Framework is active and being refined against new evidence.',
        emergent: 'Framework is a working hypothesis without specimen validation.',
      },
      falsifiability: 'Each research entry includes an \'unresolvedEdges\' field naming explicit open questions and conditions under which the framework would require revision.',
    },

    // ── Terminology Conventions ─────────────────────────────────────────────
    terminologyConventions: {
      governance: 'Structural capacity to prevent, detect, and correct failures — not documentation, policy, or compliance theater.',
      cognitiveInfrastructure: 'The institutional capacity to think, decide, and act well in the presence of intelligent systems. Distinct from technical capability, data infrastructure, and AI literacy.',
      sovereignty: 'The condition in which a human or institution retains meaningful authority over consequential decisions made by AI systems.',
      crystallization: 'Epistemic status of a framework — the degree to which its claims are supported by multiple specimens and unlikely to change structurally.',
    },

    // ── Machine-Readable Endpoints ──────────────────────────────────────────
    machineReadableEndpoints: {
      knowledgeGraph: `${SITE.url}/api/v0-alpha-graph.json`,
      researchIndex: `${SITE.url}/research-index.json`,
      knowledgeManifest: `${SITE.url}/knowledge-manifest.json`,
      sitemap: `${SITE.url}/sitemap-index.xml`,
      rss: `${SITE.url}/rss.xml`,
    },

    // ── Canonical Citation Instructions ─────────────────────────────────────
    howToCite: {
      author: 'Hillary Njuguna',
      institutionUrl: SITE.url,
      preferredCitationStyle: 'Author, Year, Title, URL, [Version if applicable]',
      example: 'Njuguna, H. (2026). The Bainbridge Warning (v1.2). https://hillarynjuguna.vercel.app/research/bainbridge-warning',
      license: 'CC BY-NC-SA 4.0 — cite with attribution, non-commercial use, share-alike.',
    },
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
    },
  });
};
