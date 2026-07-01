export const prerender = true;
/**
 * GET /research-index.json
 *
 * Pre-rendered static JSON index of all published research entries.
 * Machine-readable without HTML parsing. Designed for AI RAG ingestion.
 *
 * Schema fields per entry:
 *   id, slug, title, description, abstract, keyClaims, concepts,
 *   tags, domains, lineage, version, crystallization, researchType,
 *   publishedAt, updatedAt, readingTimeMinutes (estimated), url
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '@data/site';

export const GET: APIRoute = async () => {
  const entries = await getCollection('research', ({ data }) => !data.draft);

  const sorted = entries.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );

  const index = sorted.map((entry) => {
    const { data } = entry;
    const url = `${SITE.url}/research/${entry.slug}`;
    // Rough estimate: ~200 words per minute, average research entry ~4000 words
    const wordCount = 4000; // placeholder; would need content parsing for exact count
    const readingTimeMinutes = Math.ceil(wordCount / 200);

    return {
      id: data.id ?? `research-${entry.slug}`,
      slug: entry.slug,
      url,
      title: data.title,
      description: data.summary,
      // abstract: first keyClaim — the single most extractable sentence
      abstract: data.keyClaims?.[0] ?? data.summary,
      keyClaims: data.keyClaims ?? [],
      unresolvedEdges: data.unresolvedEdges ?? [],
      concepts: data.concepts ?? [],
      tags: data.tags ?? [],
      domains: data.domains ?? [],
      lineage: data.lineage ?? [],
      researchType: data.researchType ?? null,
      version: data.version ?? null,
      changelog: data.changelog ?? [],
      crystallization: data.crystallization,
      governanceRelevance: data.governanceRelevance ?? 'none',
      publishedAt: data.publishedAt.toISOString(),
      updatedAt: data.updatedAt?.toISOString() ?? null,
      readingTimeMinutes,
      author: {
        name: data.author ?? SITE.author.name,
        url: SITE.url,
      },
    };
  });

  const payload = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Hillary Njuguna — Research Index',
    description: 'Machine-readable index of all published research entries in the Hillary Njuguna corpus.',
    url: `${SITE.url}/research-index.json`,
    creator: {
      '@type': 'Person',
      name: SITE.author.name,
      url: SITE.url,
    },
    numberOfItems: index.length,
    dateGenerated: new Date().toISOString(),
    itemListElement: index.map((entry, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'ScholarlyArticle',
        '@id': entry.url,
        name: entry.title,
        description: entry.description,
        abstract: entry.abstract,
        url: entry.url,
        datePublished: entry.publishedAt,
        dateModified: entry.updatedAt ?? entry.publishedAt,
        author: {
          '@type': 'Person',
          name: entry.author.name,
          url: entry.author.url,
        },
        keywords: [...entry.tags, ...entry.concepts].join(', '),
        about: entry.domains.map((d) => ({ '@type': 'Thing', name: d })),
        // Non-standard extension fields — consumed by AI RAG pipelines
        'x-keyClaims': entry.keyClaims,
        'x-version': entry.version,
        'x-crystallization': entry.crystallization,
        'x-governanceRelevance': entry.governanceRelevance,
        'x-lineage': entry.lineage,
      },
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'X-Index-Count': String(index.length),
      'X-Schema-Version': '1.0',
    },
  });
};
