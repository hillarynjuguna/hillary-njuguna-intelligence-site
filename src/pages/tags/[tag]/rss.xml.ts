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
  const allGroups = [
    ...Object.values(taxonomy.domains),
    ...Object.values(taxonomy.themes),
    ...Object.values(taxonomy.tags),
  ];
  const mergedBySlug = new Map<string, { labels: string[]; contentIds: Set<string> }>();

  for (const group of allGroups) {
    const slug = slugify(group.label);
    const existing = mergedBySlug.get(slug);

    if (existing) {
      existing.labels.push(group.label);
      for (const contentId of group.contentIds) existing.contentIds.add(contentId);
      continue;
    }

    mergedBySlug.set(slug, {
      labels: [group.label],
      contentIds: new Set(group.contentIds),
    });
  }

  return Array.from(mergedBySlug.entries()).map(([tag, merged]) => ({
    params: { tag },
    props: {
      labels: merged.labels,
      contentIds: Array.from(merged.contentIds),
    },
  }));
}

export const GET: APIRoute = async (context) => {
  const { labels, contentIds } = context.props;
  const taxonomy = await loadTaxonomyIndex();
  const graph = await loadContentGraph();

  const group = labels
    .map((label: string) => taxonomy.domains[label] || taxonomy.themes[label] || taxonomy.tags[label])
    .find(Boolean);

  if (!group) {
    return new Response('Tag not found', { status: 404 });
  }

  // Filter nodes by their IDs being in the group
  const relatedNodes = graph.nodes.filter(node => 
    contentIds.includes(node.id) && node.status === 'published'
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
