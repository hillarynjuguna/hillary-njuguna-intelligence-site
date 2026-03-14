import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '@data/site';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  const digest = await getCollection('digest', ({ data }) => !data.draft);
  const sorted = digest.sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf()
  );

  return rss({
    title: `${SITE.name} — Intelligence Digest`,
    description: 'Field notes from active synthesis. Live analysis across AI governance, institutional deployment, and constitutional design.',
    site: context.site?.toString() ?? SITE.url,
    items: sorted.map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.publishedAt,
      description: entry.data.summary,
      link: `/digest/${entry.slug}/`,
      categories: entry.data.tags,
      author: entry.data.author,
    })),
    customData: `<language>en-us</language>`,
  });
};
