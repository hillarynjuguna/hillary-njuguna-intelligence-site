export const prerender = true;
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Machine-readable content index for search and AIEO retrieval
export const GET: APIRoute = async () => {
  const [digest, research, products, clauses] = await Promise.all([
    getCollection('digest', ({ data }) => !data.draft),
    getCollection('research', ({ data }) => !data.draft),
    getCollection('products', ({ data }) => !data.draft),
    getCollection('clauses', ({ data }) => data.publishStatus !== 'draft'),
  ]);

  const index = [
    ...digest.map((e) => ({
      id: `digest/${e.slug}`,
      type: 'digest',
      title: e.data.title,
      summary: e.data.summary,
      excerpt: e.data.excerpt ?? e.data.summary.slice(0, 160),
      tags: e.data.tags,
      category: e.data.category,
      publishedAt: e.data.publishedAt.toISOString(),
      url: `/digest/${e.slug}`,
    })),
    ...research.map((e) => ({
      id: `research/${e.slug}`,
      type: 'research',
      title: e.data.title,
      summary: e.data.summary,
      excerpt: e.data.excerpt ?? e.data.summary.slice(0, 160),
      tags: e.data.tags,
      themes: e.data.themes,
      concepts: e.data.concepts,
      publishedAt: e.data.publishedAt.toISOString(),
      url: `/research/${e.slug}`,
    })),
    ...products.map((e) => ({
      id: `products/${e.slug}`,
      type: 'products',
      title: e.data.title,
      summary: e.data.summary,
      excerpt: e.data.excerpt ?? e.data.summary.slice(0, 160),
      status: e.data.status,
      productType: e.data.productType,
      url: `/products/${e.slug}`,
    })),
    ...clauses.map((e) => ({
      id: `clauses/${e.slug}`,
      type: 'clauses',
      title: e.data.title,
      summary: e.data.notes ?? e.data.clauseText ?? '',
      excerpt: e.data.notes?.slice(0, 160) ?? e.data.clauseText?.slice(0, 160) ?? '',
      status: e.data.clauseStatus,
      url: `/clauses/${e.slug}`,
    })),
  ];

  return new Response(JSON.stringify({ index, generated: new Date().toISOString() }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
