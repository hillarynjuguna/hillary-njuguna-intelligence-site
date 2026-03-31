import rss from '@astrojs/rss';
import { loadTaxonomyIndex, loadContentGraph } from '@lib/generated/loaders';
import { SITE } from '@data/site';
import type { APIRoute } from 'astro';

export const prerender = true;

/**
 * Slugify a string specifically for RSS route matching.
 */
function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-');
}

export async function getStaticPaths() {
  const taxonomy = await loadTaxonomyIndex();
  const allTags = new Set([
    ...Object.keys(taxonomy.domains),
    ...Object.keys(taxonomy.themes),
    ...Object.keys(taxonomy.tags)
  ]);

  return Array.from(allTags).map(tag => ({
    params: { tag: slugify(tag) },
    props: { originalTag: tag }
  }));
}

export const GET: APIRoute = async (context) => {
  const { originalTag } = context.props;
  const taxonomy = await loadTaxonomyIndex();
  const graph = await loadContentGraph();

  // Find the group in taxonomy
  const group = taxonomy.domains[originalTag] || taxonomy.themes[originalTag] || taxonomy.tags[originalTag];

  if (!group) {
    return new Response('Tag not found', { status: 404 });
  }

  // Filter nodes by their IDs being in the group
  const relatedNodes = graph.nodes.filter(node => 
    group.contentIds.includes(node.id) && node.status === 'published'
  );

  // Deterministic sort: newest first
  const sorted = relatedNodes.sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;
  });

  return rss({
    title: `${SITE.name} — ${group.label}`,
    description: `Research feed for ${group.label} from the Oscillatory Fields corpus.`,
    site: context.site?.toString() ?? SITE.url,
    items: sorted.map((node) => ({
      title: node.title,
      pubDate: new Date(node.publishedAt || Date.now()),
      description: node.description || '',
      link: `${SITE.url}/${node.contentType}/${node.slug}/`,
      categories: [group.label],
    })),
    customData: `<language>en-us</language>`,
  });
};
