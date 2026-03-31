import rss from '@astrojs/rss';
import { SITE } from '@data/site';
import { loadTaxonomyIndex, loadContentGraph } from '@lib/generated/loaders';
import type { APIRoute } from 'astro';

export async function getStaticPaths() {
  const taxonomy = await loadTaxonomyIndex();
  
  // Combine all keys from domains, themes, and tags for path generation
  const allTags = new Set([
    ...Object.keys(taxonomy.domains),
    ...Object.keys(taxonomy.themes),
    ...Object.keys(taxonomy.tags)
  ]);

  return Array.from(allTags).map(tag => ({
    params: { tag }
  }));
}

export const GET: APIRoute = async (context) => {
  const { tag } = context.params;
  
  if (!tag) {
    return new Response('Tag not provided', { status: 400 });
  }

  const taxonomy = await loadTaxonomyIndex();
  const graph = await loadContentGraph();

  // Find the group in any category
  const group = taxonomy.domains[tag] || taxonomy.themes[tag] || taxonomy.tags[tag];

  if (!group) {
    return new Response('Tag not found', { status: 404 });
  }

  // Filter content nodes by the IDs in the taxonomy group
  const relatedNodes = graph.nodes
    .filter(node => group.contentIds.includes(node.id))
    .sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });

  return rss({
    title: `${group.label} — ${SITE.name} Research`,
    description: `Specialized feed for the '${group.label}' domain within the Oscillatory Fields intelligence corpus.`,
    site: context.site?.toString() ?? SITE.url,
    items: relatedNodes.map((node) => ({
      title: node.title,
      pubDate: node.publishedAt ? new Date(node.publishedAt) : new Date(),
      description: node.description || '',
      link: `/${node.sourceCollection}/${node.slug}/`,
      categories: [...new Set([...node.domains, ...node.themes, ...node.tags])],
    })),
    customData: `<language>en-us</language>`,
  });
};
